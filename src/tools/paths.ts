import * as path from 'path';

const ROOT_DIR = path.resolve(__dirname, '..');
export default {
  ROOT_DIR,
  LIB_DIR: path.join(ROOT_DIR, 'src'),
  MDL_DIR: path.join(ROOT_DIR, 'src/model'),
  CLASS_DIR: path.join(ROOT_DIR, 'src/class'),
  TOOL_DIR: path.join(ROOT_DIR, 'src/tools'),
  ROUTER: path.join(ROOT_DIR, 'routes'),
  MIDDLE_DIR: path.join(ROOT_DIR, 'src/middle'),
};
