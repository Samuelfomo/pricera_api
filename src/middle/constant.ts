interface TokenConfig {
  secret: string;
  expiresIn: string;
}

interface AppConfig {
  version: string;
  name: string;
  appCode: string;
  identified: string | null;
}

interface Constant {
  token: TokenConfig;
  config: AppConfig;
}

const constant: Constant = {
  token: {
    secret: '11P22R33I44C55E666R777A8A9P0I',
    expiresIn: '24h',
  },
  config: {
    version: '1.0.0',
    name: 'PRICERA',
    appCode: '11235@677P',
    identified: null,
  },
};

export default constant;

// const constant = {
//   token: {
//     secret: '11P22R33I44C55E666R777A8A9P0I',
//     expiresIn: '24h',
//   },
//   config: {
//     version: '1.0.0',
//     name: 'PRICERA',
//     appCode: '11235@677P',
//     identified: null,
//   },
// };
// export default constant;
