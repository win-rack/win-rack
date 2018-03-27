function clickforce_rtid(b) { 
	var f = document.getElementsByTagName("script")[0]; 
	var a = document.createElement("iframe");
    a.setAttribute("src", "https://cdn.doublemax.net/js/capmapping.htm?rtid=" + b);
    a.setAttribute("width", 0);
    a.setAttribute("height", 0);
    a.setAttribute("style", "display:none;");
    f.parentNode.insertBefore(a, f); var a = document.createElement("iframe");
    a.setAttribute("src", "//clg.doublemax.net/adserver/conversionV2/clickAction?aid=" + b);
    a.setAttribute("width", 0);
    a.setAttribute("height", 0);
    a.setAttribute("style", "display:none;");
    f.parentNode.insertBefore(a, f); var a = document.createElement("iframe");
    a.setAttribute("src", "//lg.doublemax.net/adserver/conversionV2/impressAction?aid=" + b);
    a.setAttribute("width", 0);
    a.setAttribute("height", 0);
    a.setAttribute("style", "display:none;");
    f.parentNode.insertBefore(a, f) };