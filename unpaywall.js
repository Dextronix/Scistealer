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