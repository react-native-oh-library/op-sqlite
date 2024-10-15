/*
 * MIT License
 *
 * Copyright (C) 2024 Huawei Device Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

#include "RNOpSqliteTurboModule.h"
#include "bindings.h"

using namespace rnoh;
using namespace facebook;

namespace rnoh {

    static jsi::Value _hostFunction_RNOpSqliteTurboModuleSpecJSI_installFun(
      jsi::Runtime &rt,
      react::TurboModule &turboModule,
      const jsi::Value *args,
      size_t count)
    {
        ArkTSTurboModule &self = static_cast<ArkTSTurboModule &>(turboModule);
        auto base_path_value = self.call(rt,"getConstants", args, count);
        if (base_path_value.isObject()) {
            const facebook::jsi::Object& base_path_obj = base_path_value.asObject(rt);
            auto base_path = base_path_obj.getProperty(rt, "HARMONY_DATABASE_PATH");
            std::string base_path_str = (base_path).asString(rt).utf8(rt);
            auto thatSelf = static_cast<RNOpSqliteTurboModuleSpecJSI *>(&turboModule);
            thatSelf->install(rt,base_path_str);
            return true;
        };
        return false;
    }

    void RNOpSqliteTurboModuleSpecJSI::install(facebook::jsi::Runtime &rt,std::string &basePath) 
    {
        auto jsInvoker = this->jsInvoker_;
        opsqlite::install(rt,jsInvoker,basePath.c_str(),"libcrsqlite","libsqlite_vec");
    }

    static jsi::Value _hostFunction_RNOpSqliteTurboModuleSpecJSI_getConstants(
      jsi::Runtime &rt,
      react::TurboModule &turboModule,
      const jsi::Value *args,
      size_t count)
    {
      return static_cast<ArkTSTurboModule &>(turboModule).call(rt, "getConstants", args, count);
    }
    
    static jsi::Value _hostFunction_RNOpSqliteTurboModuleSpecJSI_moveAssetsDatabase(
      jsi::Runtime &rt,
      react::TurboModule &turboModule,
      const jsi::Value *args,
      size_t count)
    {
      return static_cast<ArkTSTurboModule &>(turboModule).call(rt, "moveAssetsDatabase", args, count);
    }
    
    RNOpSqliteTurboModuleSpecJSI::RNOpSqliteTurboModuleSpecJSI(
      const ArkTSTurboModule::Context ctx,
      const std::string name): ArkTSTurboModule(ctx, name)
    {
      methodMap_["getConstants"] =
        MethodMetadata{0, _hostFunction_RNOpSqliteTurboModuleSpecJSI_getConstants};
      methodMap_["install"] = MethodMetadata{0, _hostFunction_RNOpSqliteTurboModuleSpecJSI_installFun};
      methodMap_["moveAssetsDatabase"] =
        MethodMetadata{1, _hostFunction_RNOpSqliteTurboModuleSpecJSI_moveAssetsDatabase};
    }
}





