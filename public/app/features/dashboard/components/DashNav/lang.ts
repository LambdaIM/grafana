type X = { [key: string]: Object };
type Y = { [key: string]: string };

let zhch: Y = {
  home: '首页',
  testcoin: '测试币',
  browser: '浏览器',
  Mainnetwork: '主网',
  Testnetwork: '测试网',
};

let en: Y = {
  home: 'Home',
  testcoin: 'Testcoin',
  browser: 'Browser',
  Mainnetwork: 'Main net',
  Testnetwork: 'Test net',
};

let y: X = {
  zhch: zhch,
  en: en,
};
let obj: Y = {
  home_zh: '首页',
  doc_zh: '开发者文档',
  testcoin_zh: '测试币',
  browser_zh: '浏览器',
  Mainnetwork_zh: '主网',
  Testnetwork_zh: '测试网',
  About_zh: '关于Lambda',
  home_en: 'Home',
  doc_en: 'Developer Docs',
  testcoin_en: 'Testcoin',
  browser_en: 'Browser',
  Mainnetwork_en: 'Main net',
  Testnetwork_en: 'Test net',
  About_en: 'About Lambda',
};

export default obj;
