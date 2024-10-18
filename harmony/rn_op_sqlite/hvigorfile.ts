import { harTasks, OhosHarContext, OhosPluginId } from '@ohos/hvigor-ohos-plugin';
import { getNode, hvigor, HvigorNode, HvigorPlugin } from '@ohos/hvigor';

// export { harTasks } from '@ohos/hvigor-ohos-plugin';

const path = require('path');
const fs = require('fs');

// 实现自定义OPSQLITE插件
export function opSqlitePlugin(rootPackagePath?: string, options: OnlineSignOptions): HvigorPlugin {
  return {
    pluginId: 'opSqlitePluginId',
    context() {
      return {
        signConfig: options
      };
    },
    apply(node: HvigorNode) {
      // 插件主体
      console.log('hello opSqlitePlugin!');
      console.log(__dirname);
      let useSQLCipher: boolean = false;
      let useLibsql: boolean = false;
      let useCRSQLite: boolean = false;
      let performanceMode: string = '2';
      let sqliteFlags: string = '';
      let enableFTS5: boolean = true;
      let useSqliteVec: boolean = false;
      let filePath: string = rootPackagePath;
      console.log('rootPackagePath:', rootPackagePath);
      if (!rootPackagePath || !fs.existsSync(filePath)) {
        filePath = path.join(__dirname, '../../../../../package.json');
      }
      if (!fs.existsSync(filePath)) {
        filePath = path.join(__dirname, '../../package.json');
      }
      console.log('filePath', filePath);
      if (fs.existsSync(filePath)) {
        let packageJson: Object = require(filePath);
        let opsqliteConfig: Object = packageJson['op-sqlite'];
        console.log('opsqliteConfig', opsqliteConfig ? opsqliteConfig : 'empty');
        if (opsqliteConfig) {
          useSQLCipher = opsqliteConfig['sqlcipher'];
          useCRSQLite = opsqliteConfig['crsqlite'];
          useSqliteVec = opsqliteConfig['sqliteVec'];
          performanceMode = opsqliteConfig['performanceMode'] ? opsqliteConfig['performanceMode'] : '';
          sqliteFlags = opsqliteConfig['sqliteFlags'] ? opsqliteConfig['sqliteFlags'] : '';
          enableFTS5 = opsqliteConfig['fts5'];
          useLibsql = opsqliteConfig['libsql'];
        }
      }
      if (useSQLCipher) {
        console.log('[OP-SQLITE] using SQLCipher 🔒');
      } else if (useLibsql) {
        console.log('[OP-SQLITE] using libsql 📦');
      } else {
        console.log('[OP-SQLITE] using Vanilla SQLite');
      }

      if (useCRSQLite) {
        console.log('[OP-SQLITE] using CR-SQLite 🤖');
      }

      if (performanceMode == '1') {
        console.log('[OP-SQLITE] Thread unsafe performance mode enabled. Use only transactions! 🚀');
      }

      if (performanceMode == '2') {
        console.log('[OP-SQLITE] Thread safe performance mode enabled! 🚀');
      }

      if (enableFTS5) {
        console.log('[OP-SQLITE] FTS5 enabled! 🔎');
      }

      if (useSqliteVec) {
        console.log('[OP-SQLITE] Sqlite Vec enabled! ↗️');
      }

      let cFlags: string[] = [];
      let cppFlags: string[] = [];
      if (useSQLCipher) {
        cFlags.push('-DOP_SQLITE_USE_SQLCIPHER=1');
        cppFlags.push('-DOP_SQLITE_USE_SQLCIPHER=1');
      }
      if (useLibsql) {
        cFlags.push('-DOP_SQLITE_USE_LIBSQL=1');
        cppFlags.push('-DOP_SQLITE_USE_LIBSQL=1');
      }
      if (useCRSQLite) {
        cFlags.push('-DOP_SQLITE_USE_CRSQLITE=1');
        cppFlags.push('-DOP_SQLITE_USE_CRSQLITE=1');
      }
      if (performanceMode == '1') {
        cFlags = cFlags.concat(['-DSQLITE_DQS=0', '-DSQLITE_THREADSAFE=0', '-DSQLITE_DEFAULT_MEMSTATUS=0',
          '-DSQLITE_DEFAULT_WAL_SYNCHRONOUS=1', '-DSQLITE_LIKE_DOESNT_MATCH_BLOBS=1', '-DSQLITE_MAX_EXPR_DEPTH=0',
          '-DSQLITE_OMIT_DEPRECATED=1', '-DSQLITE_OMIT_PROGRESS_CALLBACK=1', '-DSQLITE_OMIT_SHARED_CACHE=1',
          '-DSQLITE_USE_ALLOCA=1']);
      }
      if (performanceMode == '2') {
        cFlags = cFlags.concat(['-DSQLITE_DQS=0', '-DSQLITE_THREADSAFE=1', '-DSQLITE_DEFAULT_MEMSTATUS=0',
          '-DSQLITE_DEFAULT_WAL_SYNCHRONOUS=1', '-DSQLITE_LIKE_DOESNT_MATCH_BLOBS=1', '-DSQLITE_MAX_EXPR_DEPTH=0',
          '-DSQLITE_OMIT_DEPRECATED=1', '-DSQLITE_OMIT_PROGRESS_CALLBACK=1', '-DSQLITE_OMIT_SHARED_CACHE=1',
          '-DSQLITE_USE_ALLOCA=1']);
      }
      if (enableFTS5) {
        cFlags =
          cFlags.concat(['-DSQLITE_ENABLE_FTS4=1', '-DSQLITE_ENABLE_FTS3_PARENTHESIS=1', '-DSQLITE_ENABLE_FTS5=1']);
      }
      if (useSqliteVec) {
        cFlags.push('-DOP_SQLITE_USE_SQLITE_VEC=1');
        cppFlags.push('-DOP_SQLITE_USE_SQLITE_VEC=1');
      }
      console.log(cFlags.join(' '));
      console.log(cppFlags.join(' '));
      const appContext: OhosHapContext = node.getContext(OhosPluginId.OHOS_HAP_PLUGIN) as OhosHapContext;
      const buildProfileOpt: Object = appContext.getBuildProfileOpt();
      let argumentsArray: string[] = ['-DCMAKE_BUILD_TYPE=RelWithDebInfo', '-DANDROID_STL=c++_shared'];
      argumentsArray.push('-DSQLITE_FLAGS=' + sqliteFlags);
      argumentsArray.push('-DUSE_SQLCIPHER=' + (useSQLCipher ? 1 : 0));
      argumentsArray.push('-DUSE_CRSQLITE=' + (useCRSQLite ? 1 : 0));
      argumentsArray.push('-DUSE_LIBSQL=' + (useLibsql ? 1 : 0));
      argumentsArray.push('-DUSE_SQLITE_VEC=' + (useSqliteVec ? 1 : 0));
      console.log(argumentsArray.join(' '));
      buildProfileOpt['buildOption']['externalNativeOptions']['arguments'] = argumentsArray.join(' ');
      buildProfileOpt['buildOption']['externalNativeOptions']['cppFlags'] = cppFlags.join(' ');
      buildProfileOpt['buildOption']['externalNativeOptions']['cFlags'] = cFlags.join(' ');
      appContext.setBuildProfileOpt(buildProfileOpt);
    }
  }
}

export default {
  system: harTasks, plugins: []
}
