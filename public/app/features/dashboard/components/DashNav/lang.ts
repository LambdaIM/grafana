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
  home_zhch: '首页',
  doc_zhch: '文档',
  testcoin_zhch: '测试币',
  browser_zhch: '浏览器',
  Mainnetwork_zhch: '主网',
  Testnetwork_zhch: '测试网',
  home_en: 'Home',
  doc_en: 'Docs',
  testcoin_en: 'Testcoin',
  browser_en: 'Browser',
  Mainnetwork_en: 'Main net',
  Testnetwork_en: 'Test net',
};

export default obj;
