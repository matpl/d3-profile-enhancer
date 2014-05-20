// original ref to html function
$.fn.htmlOriginal = $.fn.html;

// html() redifinition
$.fn.html = function (html) {
    // run the old html
    if(html == null)
    {
        var result = this.htmlOriginal();
    }
    else
    {
        var result = this.htmlOriginal(html);
    }
    if(html != null)
    {
        try
        {
            var jHtml = $(html);
            if(jHtml.find('a.hero-tab').length > 0)
            {
                document.dispatchEvent(new CustomEvent('loadProfileCallback'));
            }
        }
        catch(err) { }
    }
    return result;
}