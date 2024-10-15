cmake_minimum_required(VERSION 3.4.1)
cmake_policy(SET CMP0079 NEW)
set (CMAKE_CXX_STANDARD 17)

if(NOT WITH_HITRACE_SYSTRACE)
    add_compile_definitions(WITH_HITRACE_SYSTRACE)
    set(WITH_HITRACE_SYSTRACE 1) # for other CMakeLists.txt files to use
endif()

set(NATIVERENDER_ROOT_PATH ${CMAKE_CURRENT_SOURCE_DIR})
set (PACKAGE_NAME "rnoh_rn_op_sqlite")

set(OPSQLITE_COMMON_ROOT_DIR "${NODE_MODULES}/@react-native-oh-tpl/op-sqlite/cpp")
set(OPSQLITE_COMMON_LIBSQL_DIR "${OPSQLITE_COMMON_ROOT_DIR}/libsql")
set(OPSQLITE_COMMON_SQLCIPHER_DIR "${OPSQLITE_COMMON_ROOT_DIR}/sqlcipher")

set(third_party_dir "${CMAKE_CURRENT_SOURCE_DIR}/thirdparty")
set(OPENSSL_CRYPTO_LIBRARY  "${third_party_dir}/openssl/${OHOS_ARCH}/lib")
set(OPENSSL_INCLUDE_DIR  "${third_party_dir}/openssl/${OHOS_ARCH}/include")
set(OPENSSL_ROOT_DIR  "${third_party_dir}/openssl/${OHOS_ARCH}")
#set(LIBSQL_ROOT_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../libs/${OHOS_ARCH}")
set(LIBSQL_ROOT_DIR "${third_party_dir}/libsql/${OHOS_ARCH}/lib")
set(LIBSQL_INCLUDE_DIR  "${third_party_dir}/libsql/${OHOS_ARCH}/include")


if(SQLITE_FLAGS)
    message(STATUS "SQLITE_FLAGS === ${SQLITE_FLAGS}")
    add_definitions(
      ${SQLITE_FLAGS}
    )
endif()

include_directories(${NATIVERENDER_ROOT_PATH}
                    ${NATIVERENDER_ROOT_PATH}/include
                    ${OPSQLITE_COMMON_ROOT_DIR}
                    ${OPSQLITE_COMMON_SQLCIPHER_DIR}
                    ${OPSQLITE_COMMON_LIBSQL_DIR})

file(GLOB rnoh_rn_op_sqlite_SRC CONFIGURE_DEPENDS *.cpp)
add_library(${PACKAGE_NAME}
    SHARED
    ${rnoh_rn_op_sqlite_SRC}
    ${OPSQLITE_COMMON_ROOT_DIR}/types.h
    ${OPSQLITE_COMMON_ROOT_DIR}/logs.h
    ${OPSQLITE_COMMON_ROOT_DIR}/macros.h
    ${OPSQLITE_COMMON_ROOT_DIR}/bindings.cpp
    ${OPSQLITE_COMMON_ROOT_DIR}/bindings.h
    ${OPSQLITE_COMMON_ROOT_DIR}/utils.h
    ${OPSQLITE_COMMON_ROOT_DIR}/utils.cpp
    ${OPSQLITE_COMMON_ROOT_DIR}/ThreadPool.h
    ${OPSQLITE_COMMON_ROOT_DIR}/ThreadPool.cpp
    ${OPSQLITE_COMMON_ROOT_DIR}/SmartHostObject.h
    ${OPSQLITE_COMMON_ROOT_DIR}/SmartHostObject.cpp
    ${OPSQLITE_COMMON_ROOT_DIR}/PreparedStatementHostObject.h
    ${OPSQLITE_COMMON_ROOT_DIR}/PreparedStatementHostObject.cpp
    ${OPSQLITE_COMMON_ROOT_DIR}/DumbHostObject.h
    ${OPSQLITE_COMMON_ROOT_DIR}/DumbHostObject.cpp
    ${OPSQLITE_COMMON_ROOT_DIR}/DBHostObject.h
    ${OPSQLITE_COMMON_ROOT_DIR}/DBHostObject.cpp
)
target_include_directories(${PACKAGE_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})

 if (USE_SQLCIPHER)

   add_definitions(
     -DOP_SQLITE_USE_SQLCIPHER=1
     -DSQLITE_HAS_CODEC
     -DSQLITE_TEMP_STORE=2
   )
   set(C_SOURCES ${OPSQLITE_COMMON_SQLCIPHER_DIR}/sqlite3.c)
   target_sources(${PACKAGE_NAME} PRIVATE ${OPSQLITE_COMMON_ROOT_DIR}/bridge.h ${OPSQLITE_COMMON_ROOT_DIR}/bridge.cpp ${OPSQLITE_COMMON_SQLCIPHER_DIR}/sqlite3.h ${OPSQLITE_COMMON_SQLCIPHER_DIR}/sqlite3.c )
   find_package(OpenSSL REQUIRED)

 elseif (USE_LIBSQL)

   add_definitions(
     -DOP_SQLITE_USE_LIBSQL=1
   )
   target_sources(${PACKAGE_NAME} PRIVATE ${OPSQLITE_COMMON_LIBSQL_DIR}/libsql.h ${OPSQLITE_COMMON_LIBSQL_DIR}/bridge.h ${OPSQLITE_COMMON_LIBSQL_DIR}/bridge.cpp)

 else()
  set(C_SOURCES ${OPSQLITE_COMMON_ROOT_DIR}/sqlite3.c)
  target_sources(${PACKAGE_NAME} PRIVATE ${OPSQLITE_COMMON_ROOT_DIR}/sqlite3.h ${OPSQLITE_COMMON_ROOT_DIR}/sqlite3.c ${OPSQLITE_COMMON_ROOT_DIR}/bridge.h ${OPSQLITE_COMMON_ROOT_DIR}/bridge.cpp)
 endif()

 if (USE_CRSQLITE)
   add_definitions(
     -DOP_SQLITE_USE_CRSQLITE=1
   )
 endif()

 if (USE_SQLITE_VEC)
   add_definitions(
     -DOP_SQLITE_USE_SQLITE_VEC=1
   )
 endif()

 set_target_properties(
   ${PACKAGE_NAME} PROPERTIES
   CXX_STANDARD 17
   CXX_EXTENSIONS OFF
   POSITION_INDEPENDENT_CODE ON
 )

 target_link_libraries(${PACKAGE_NAME} PUBLIC libace_napi.z.so)
 target_link_libraries(${PACKAGE_NAME} PUBLIC libhilog_ndk.z.so)
 target_link_libraries(${PACKAGE_NAME} PUBLIC rnoh)

 if (USE_SQLCIPHER)
   target_link_libraries(
     ${PACKAGE_NAME}
      PRIVATE
      ${OPENSSL_CRYPTO_LIBRARY}/libssl.a
      ${OPENSSL_CRYPTO_LIBRARY}/libcrypto.a
   )
   #将三方库的头文件加入工程中
   target_include_directories(${PACKAGE_NAME} PRIVATE ${OPENSSL_INCLUDE_DIR})
 elseif (USE_LIBSQL)
   link_directories("${NATIVERENDER_ROOT_PATH}/../../../libs/${CMAKE_OHOS_ARCH_ABI}")
   add_library(libsql STATIC IMPORTED)
   set_target_properties(libsql PROPERTIES IMPORTED_LOCATION ${LIBSQL_ROOT_DIR}/libsql_experimental.a)

   target_link_libraries(
     ${PACKAGE_NAME}
     PUBLIC
     libsql
   )
   target_include_directories(${PACKAGE_NAME} PRIVATE ${LIBSQL_INCLUDE_DIR})
 else ()
 endif()


