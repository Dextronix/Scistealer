// ==UserScript==
// @match      *://*/*
// @name         Sci-Stealer
// @run-at       document-end
// @require      http://code.jquery.com/jquery-3.3.1.min.js
// @version      0.1
// @description  (First public release) Increases access to knowledge
// @author       Dextronix
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.deleteValue
// ==/UserScript==
//

// paywall globals
var myHost     = window.location.href;
var docAsStr   = document.documentElement.innerHTML;
var allSources = [];

// scistealer globals
var ua         = navigator.userAgent.toLowerCase();
var isAndroid  = ua.indexOf("android") > -1;
var scihub_URL = ["sci-hub.ren","sci-hub.fun","sci-hub.mu","sci-hub.se","sci-hub.tw","sci-hub.shop","sci-hub.ooo","sci-hub.ga","sci-hub.nz","sci-hub.is","sci-hub.la","80.82.77.83","80.82.77.84"];
var proxies    = ["www.croxyproxy.com/","hide.me/en/proxy","www.proxysite.com/"];
var defaultsettings = {scihubURL:"4",scihubproxy:"true",bookscproxy:"true",autoclick:"false",prefproxy:"2",urlblacklist:["youtube.com","reddit.com","google.com"]};
var settings;
var  doi, Mdoi;
var datex = new Date();
var THISYEAR = datex.getFullYear();

(async () => {
	// Get values
	 settings    = await GM.getValue("SS_SETTINGS");
	let TITLE   = await GM.getValue("SS_TITLE");
	let PROXY   = await GM.getValue("SS_PROXY");
  Mdoi         = await GM.getValue("SS_DOI");
	
	if (settings == undefined) {
    GM.setValue("SS_SETTINGS", defaultsettings);
    settings = defaultsettings;
    }


if (isblacklisted() == false){	
	// Booksc stuff - their site is shit so this little tidbit is needed
	if ( -1 < window.location.href.indexOf("booksc.xyz") || $("#searchFormWithLogo").length > 0) {
        $(window).scrollTop($("*:contains(" + TITLE + "):last").offset().top);
        $("*:contains(" + TITLE + "):last").css("background-color", "#FFFF00");
		GM.deleteValue("SS_TITLE");
	}
  
  // croxyproxy
	if (myHost.indexOf(proxies[0]) > 0 && PROXY) {
        var URLBar = $("input[placeholder='Enter an URL or a search query to access']");
		var Gobtn = $("#requestSubmit");
        URLBar.val(PROXY); // enter URL
		1==settings.autoclick&&Gobtn.click();
        GM.deleteValue("SS_PROXY");
    }
  
  // hideme
    if (myHost.indexOf(proxies[1]) > 0 && PROXY) {
        var URLBar = $("input[placeholder='Enter web address']");
		var Gobtn = $("#hide_register_save");
        URLBar.val(PROXY); // enter URL
		1==settings.autoclick&&Gobtn.click();
        GM.deleteValue("SS_PROXY");
    }
  
  // proxysite
  if (myHost.indexOf(proxies[2]) > 0 && PROXY) {
        var URLBar = $("input[placeholder='Enter Url']");
        URLBar.val(PROXY);
        1==settings.autoclick&&URLBar.next().click();
        GM.deleteValue("SS_PROXY");
    }
	
	if (Mdoi !== undefined){
		doi = Mdoi;
		GM.deleteValue("SS_DOI");
	}
	else
	{
		doi = findDoi();
	}
	
	if (doi !== undefined) {
		CreateMenu();  
	}
	
}

})();

function ManualDOI(){
var extractdoi = $("#manualDOI").val();
GM.setValue("SS_DOI",extractdoi);
location.reload(); 
}

function Goback(){
location.reload(); 
}

function Add_Options(){
	for (var i = 0; i < scihub_URL.length; i++) {
     var x = document.getElementById("scihubURL");
	 var option = document.createElement("option");
	 option.text = scihub_URL[i];
	 option.value = i;
	 x.add(option); 
    }
}

function LoadSets(){
$("#sci-hub_proxy").prop('checked', JSON.parse(settings.scihubproxy));
$("#booksc_proxy").prop('checked', JSON.parse(settings.bookscproxy));
$("#autoclick_btn").prop('checked', JSON.parse(settings.autoclick));
$("#proxy_pref").val(settings.prefproxy);
$("#scihubURL").val(settings.scihubURL);
$("#blockedurls").val(settings.urlblacklist);
$("#progversion").text("Version " + GM_info.script.version);
}

function SaveSets(){
var tempsets = settings || defaultsettings;
tempsets.scihubproxy = $("#sci-hub_proxy").prop('checked');
tempsets.bookscproxy = $("#booksc_proxy").prop('checked');
tempsets.autoclick = $("#autoclick_btn").prop('checked');
tempsets.prefproxy = $("#proxy_pref").val();
tempsets.scihubURL = $("#scihubURL").val();
var blockedURLs = $("#blockedurls").val();
var Blocklst = blockedURLs.split(',');
tempsets.urlblacklist = Blocklst;
GM.setValue("SS_SETTINGS", tempsets);
location.reload(); 
}

function SettingsPage(){
var setsmenu = '<meta charset="utf-8"/><html> <body> <style>input{margin: 10px}select{font-size: 15px;padding: 2px;-webkit-appearance: none;-moz-appearance: none;appearance: none;margin: 10px;background: #fff;color: #000;outline: 0}h1{text-align: center;}.subhead{color: #818384;position: relative;top: -25px;font-size: 20px;}.blacklist{resize: none;width: 100%;-moz-box-sizing: border-box;-webkit-box-sizing: border-box}.content{margin: auto;width: 60%;border: 3px solid #000;max-width: 400px;margin: auto;padding: 15px;background: #c3deb7;padding: 1px}</style> <div class="content"> <h1 class="heading">Sci-stealer Settings</h1> <h1 id="progversion" class="subhead">Version X</h1> <div class="proxystuff"> <input type="checkbox" id="sci-hub_proxy"></input> Use Proxy for scihub<br><input type="checkbox" id="booksc_proxy"></input> Use Proxy for booksc<br><input type="checkbox" id="autoclick_btn"></input> Autoclick proxy button<br><a>proxy to use:</a> <select id="proxy_pref"> <option value="0">Croxyproxy</option> <option value="1">Hide.me</option> <option value="2">Proxysite</option> </select><br><a>sci-hub url:</a> <select id="scihubURL"></select> <br><a>Blocked URLs:</a> <textarea id="blockedurls" class="blacklist" rows="4" cols="30"></textarea> <br><a>Manual DOI search:</a> <input type="text" id="manualDOI"><input type="submit" id="loadmanual" value="Load"> </div><input class="imspecial" type="submit" id="savebtn" value="Save"> <input class="imspecial" type="submit" id="backbtn" value="Go back"> </div></body></html>';
document.body.innerHTML = "";
document.head.innerHTML = "";
document.title = "Settings";
document.body.innerHTML = setsmenu;	
document.getElementById("savebtn").onclick=function(){SaveSets()};
document.getElementById("loadmanual").onclick=function(){ManualDOI()};
document.getElementById("backbtn").onclick=function(){Goback()};
LoadSets();
Add_Options();
}

function isblacklisted(){
	for (var i = 0; i < settings.urlblacklist.length; i++) {
     if (window.location.href.indexOf(settings.urlblacklist[i]) > -1){
		 return true
	 }
    }
	return false;
}

function SavePaperDate(doi){
	// This uses the CrossRef API (fallback if UPW fails)
	   $.getJSON("https://api.crossref.org/v1/works/" + doi, function(result) {
        GM.setValue("SS_TITLE", result.message.title);
    });
}

function SaveTitle(doi) {
	// this uses the Unpaywall API 
    $.getJSON("https://api.oadoi.org/v2/" + doi + "?email=unpaywall@impactstory.org", function(result) {
         GM.setValue("SS_TITLE", result.title);
		 GM.setValue("SS_YEAR", result.year);
    });
}

function HandleURL(url, ref) {
    if (settings.scihubproxy == true && ref == "scihub") {
         GM.setValue("SS_PROXY", url);
		 window.open("http://" + proxies[settings.prefproxy]);
    } else if (settings.bookscproxy == true && ref == "booksc") {
         GM.setValue("SS_PROXY", url);
        window.open("http://" + proxies[settings.prefproxy]);
    } else {
        window.open(url);
    }
}

function open_Booksc() {
    SaveTitle(doi);
    var NewDOI = doi.replace("/", "%2F");
    var bookscURL = "https://booksc.xyz/s/?q=" + NewDOI + "&t=0";
    HandleURL(bookscURL, "booksc");
}

function open_Sci_hub() {
	// "SS_YEAR"
	
	if (SS_YEAR = THISYEAR){
		HandleURL("http://sci-hub.se/" + document.URL, "scihub");
	}
	else{
		HandleURL("http://sci-hub.se/" + doi, "scihub");
	}
}

function CreateMenu() {
var notey_code = '<style>.SnippetBaseContainer{position:fixed;z-index:9999;bottom:0;left:0;right:0;background-color:#fff;color:#0c0c0d;font-size:14px;line-height:20px;border-top:1px solid transparent;box-shadow:0 1px 10px 0 rgba(12,12,13,.2);display:flex;align-items:center}.SnippetBaseContainer .innerWrapper{margin:0 auto;display:flex;align-items:center;padding:12px 25px;padding-inline-end:36px;max-width:836px}.ASRouterButton{font-weight:600;font-size:14px;white-space:nowrap;border-color:#4caf50;border-radius:2px;font-family:inherit;padding:8px 15px;margin-inline-start:12px;color:#000;cursor:pointer}.close .ASRouterButton{position:relative;border-color:red;color:#000;right:15px}.settings .ASRouterButton{border-color:#00f;color:#000}</style><div class=SnippetBaseContainer id=notey10><div class=settings><button class=ASRouterButton id=sets_elm>Settings</button></div><div class=innerWrapper><div><p class=body><span>Paper Search:</span></div><div><button class=ASRouterButton id=scihub_elm>Sci-hub.tw</button></div><div><button class=ASRouterButton id=booksc_elm>Booksc.xyz</button></div></div><div class=close><button class=ASRouterButton onclick=\'document.getElementById("notey10").style.display="none"\'>Close</button></div></div>';
var android_notey = '<style>.SnippetBaseContainer{position:fixed;z-index:9999;bottom:0;left:0;right:0;background-color:#fff;color:#0c0c0d;font-size:14px;line-height:20px;border-top:1px solid transparent;box-shadow:0 1px 10px 0 rgba(12,12,13,.2);display:flex;align-items:center}.SnippetBaseContainer .innerWrapper{margin:0 auto;display:flex;align-items:center;padding:12px 0;padding-inline-end:36px;max-width:836px}.ASRouterButton{font-weight:600;font-size:14px;white-space:nowrap;border-color:#4caf50;border-radius:2px;font-family:inherit;padding:8px 15px;margin-inline-start:12px;color:#000;cursor:pointer}.close .ASRouterButton{border-color:red;color:#000}.settings .ASRouterButton{border-color:#00f;color:#000}</style><div class=SnippetBaseContainer id=notey10> <div class=innerWrapper> <div class=settings><button class=ASRouterButton id=sets_elm>⚙️</button></div><div><button class=ASRouterButton id=scihub_elm>HUB</button></div><div><button class=ASRouterButton id=booksc_elm>BSC</button></div><div class=close><button class=ASRouterButton onclick=\'document.getElementById("notey10").style.display="none"\'>❌</button></div></div></div>';
   
   if (isAndroid == true){
	document.body.innerHTML += android_notey
	}
	else{
	document.body.innerHTML += notey_code;
	}
	
    $(".ASRouterButton").click(function() {
        var elm = $(this).attr('id');

        switch (elm) {
            case "booksc_elm":
                open_Booksc();
                break;
            case "scihub_elm":
                open_Sci_hub();
                break;
			case "sets_elm":
                SettingsPage();
                break;
            default:
                break;
        }

    });
}

/* begin unpaywall code*/

/* MIT License
Copyright (c) 2016 Impactstory
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// search functions
function runRegexOnDoc(re, host){

    if (!host || host == myHost){
        var m = re.exec(docAsStr)
        if (m && m.length > 1){
            return m[1]
        }
    }
    return false
}

function findDoiFromMetaTags(){
    var doi

    var doiMetaNames = [
        "citation_doi",
        "doi",
        "dc.doi",
        "dc.identifier",
        "dc.identifier.doi",
        "bepress_citation_doi",
        "rft_id",
        "dcsext.wt_doi"
    ];

    $("meta").each(function(i, myMeta){
        if (!myMeta.name){
            return true 
        }

        if (doiMetaNames.indexOf(myMeta.name.toLowerCase()) < 0) {
            return true 
        }

        if (myMeta.scheme && myMeta.scheme.toLowerCase() != "doi") {
            return true 
        }

        var doiCandidate = myMeta.content.replace("doi:", "").trim()
        if (doiCandidate.indexOf("10.") === 0) {
            doi = doiCandidate
        }
    })

    if (!doi){
        return null
    }

    return doi
}

function findDoiFromDataDoiAttributes(){
    var dataDoiValues =  $("*[data-doi]").map(function(){
        return this.getAttribute("data-doi")
    }).get()


    var numUniqueDois = new Set(dataDoiValues).size
    if (numUniqueDois === 1){
        return dataDoiValues[0]
    }
}

function findDoiFromScienceDirect() {
    if (myHost.indexOf("sciencedirect") < 0) {
        return
    }
    var doi

    doi = runRegexOnDoc(/SDM.doi\s*=\s*'([^']+)'/)
    if (doi) {
        return doi
    }

    var doiLinkElem = $("a[class='doi']")
    if (doiLinkElem.length){
        var m = doiLinkElem[0].innerHTML.match(/doi\.org\/(.+)/)
        if (m && m.length > 1){
            return m[1]
        }
    }

}

function findDoiFromIeee(){
    return runRegexOnDoc(/"doi":"([^"]+)"/, "ieeexplore.ieee.org")
}

function findDoiFromNumber(){
    return runRegexOnDoc(/Document Object Identifier \(DOI\): (10.*?)<\/p>/, "www.nber.org")
}

function findDoiFromPubmed(){

    if (myHost.indexOf("www.ncbi.nlm.nih.gov") < 0) {
        return
    }

    var doiLinkElem = $("a[ref='aid_type=doi']")
    if (doiLinkElem.length){
        return doiLinkElem[0].innerHTML
    }
}

function findDoiFromPsycnet(){
    var re = /href="\/doi\/(10\..+?)"/
    return runRegexOnDoc(re, "psycnet.apa.org")
}

function findDoiFromInderScienceOnline() {
    if (/(www\.)?inderscienceonline\.com/.exec(myHost)) {
        var pbContextContent = $("meta[name='pbContext']").attr("content")
        if (pbContextContent) {
            var m = /article:article:(10\.\d+[^;]*)/.exec(pbContextContent)
            if (m && m.length > 1) {
                return m[1]
            }
        }
    }

    return
}

function findDoiFromCairn() {
    if (/(www\.)?cairn\.info/.exec(myHost)) {
      var linkUrls = $('div#article-details').find('a').map(function(){ return this.href }).get()
      for (var i = 0; i < linkUrls.length; i++) {
        var m = /https?:\/\/doi.org\/(10\.\d+\/.*)/.exec(linkUrls[i])
        if (m && m.length > 1) {
              return m[1]
        }
      }
    }

    return
}

function findDoi(){
    var doiFinderFunctions = [
        findDoiFromMetaTags,
        findDoiFromDataDoiAttributes,
        findDoiFromScienceDirect,
        findDoiFromIeee,
        findDoiFromNumber,
        findDoiFromPsycnet,
        findDoiFromPubmed,
        findDoiFromInderScienceOnline,
        findDoiFromCairn
    ]

    for (var i=0; i < doiFinderFunctions.length; i++){
        var myDoi = doiFinderFunctions[i]()
        if (myDoi){
            return myDoi
        }
    }
}