var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");
pageMod.PageMod({
  include: /.*\.battle\.net\/d3\/.*\/profile\/.*/, // the url matcher of the page you want to modify
  contentScriptWhen: 'end', // when to load the tasks
  contentScriptFile: [data.url("jquery.js"), data.url("script.js")]
});