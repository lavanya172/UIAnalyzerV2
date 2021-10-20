if (typeof jQuery !== "undefined" && typeof saveAs !== "undefined") {
    (function($) {
        $.fn.wordExport = function(fileName) {
            fileName = typeof fileName !== 'undefined' ? fileName : "jQuery-Word-Export";
            var static = {
                mhtml: {
                    top: "Mime-Version: 1.0\nContent-Base: " + location.href + "\nContent-Type: Multipart/related; boundary=\"NEXT.ITEM-BOUNDARY\";type=\"text/html\"\n\n--NEXT.ITEM-BOUNDARY\nContent-Type: text/html; charset=\"utf-8\"\nContent-Location: " + location.href + "\n\n<!DOCTYPE html>\n<html>\n_html_</html>",
                    head: "<head>\n<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">\n<style>\n_styles_\n</style>\n</head>\n",
                    body: "<body>_body_</body>"
                }
            };
            var options = {
                maxWidth: 624
            };
            // Clone selected element before manipulating it
            var markup = $(this).clone();
            console.log("markup.html()------->"+markup.html());
            // Remove hidden elements from the output
            markup.each(function() {
                var self = $(this);
                if (self.is(':hidden')){
                    self.remove();
                }
            });
            var summary = markup.find('div#summary_of_compliance');
            summary.prepend("<div id='UI_title' style='background-color: lightblue;'><br><center><h2 style=\'font-weight: 500;font-family: \"Times New Roman\", Times, serif; color: black;line-height: 32px;display: inline;\'>UI Analyzer</h2></center><br></div><br>"+
            "<h2 style=\' font-weight: 500; font-family: \"Times New Roman\", Times, serif; line-height: 32px;display: inline;\'>Summary</h2><br><br><br>");
            summary.append("<h2 style=\' font-weight: 500; font-family: \"Times New Roman\", Times, serif; line-height: 32px;display: inline;\'>Recommendations</h2><br><br><br>");
            var gaugeDiv = markup.find('div#g2');
            gaugeDiv.css({ 'padding-left': '40px' });

            var images = Array();
            var img = markup.find('img');
            img.removeClass("nonedisplay");
            markup.find('img#tip_icon').addClass("nonedisplay");
            var pdf = new jsPDF("p", "mm", "a4");

           // var pdf = new jsPDF({orientation: "p", lineHeight: 0.25});
            pdf.setLineHeightFactor(0.5);
            pdf.setFontSize(1);
            for (var i = 0; i < img.length; i++) {
                if(img[i].id == "delite_badge" || img[i].id == "tip_icon") {
                    continue
                };
                // Calculate dimensions of output image
                /*var w = Math.min(img[i].width, options.maxWidth);
                var h = img[i].height * (w / img[i].width);*/
                var pdfWidth = pdf.internal.pageSize.getWidth();
                var pdfHeight = (img[i].height * pdfWidth)/ img[i].width;
                // Create canvas for converting image to data URL
                var canvas = document.createElement("CANVAS");
                canvas.width = pdfWidth;
                canvas.height = pdfHeight;
                // Draw image to canvas
                var context = canvas.getContext('2d');
                context.drawImage(img[i], 0, 0, pdfWidth, pdfHeight);
                // Get data URL encoding of image
                var uri = canvas.toDataURL("image/png");
                $(img[i]).attr("src", img[i].src);
                img[i].width = pdfWidth*3.2;
                img[i].height = pdfHeight*3.2;
                // Save encoded image to array
                images[i] = {
                    type: uri.substring(uri.indexOf(":") + 1, uri.indexOf(";")),
                    encoding: uri.substring(uri.indexOf(";") + 1, uri.indexOf(",")),
                    location: $(img[i]).attr("src"),
                    data: uri.substring(uri.indexOf(",") + 1)
                };
            }

            // Prepare bottom of mhtml file with image data
            var mhtmlBottom = "\n";
            for (var i = 0; i < images.length; i++) {
               // mhtmlBottom += "--NEXT.ITEM-BOUNDARY\n";
               // mhtmlBottom += "Content-Location: " + images[i].location + "\n";
               // mhtmlBottom += "Content-Type: " + images[i].type + "\n";
               // mhtmlBottom += "Content-Transfer-Encoding: " + images[i].encoding + "\n\n";
                if(!images[i]) {
                    console.log("images undefined");
                    continue;
                }
                mhtmlBottom += images[i].data + "\n\n";
            }
           // mhtmlBottom += "--NEXT.ITEM-BOUNDARY--";

            //TODO: load css from included stylesheet
            var styles = "";

            // Aggregate parts of the file together
            var fileContent = static.mhtml.top.replace("_html_", static.mhtml.head.replace("_styles_", styles) + static.mhtml.body.replace("_body_", markup.html())) + mhtmlBottom;

            var opt = {
                margin:       [10, 15, 10, 15],
                filename:     `UI-AnalyzerReport.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().from(markup.html()).set(opt).save();
        };
    })(jQuery);
} else {
    if (typeof jQuery === "undefined") {
        console.error("jQuery Pdf Export: missing dependency (jQuery)");
    }
    if (typeof saveAs === "undefined") {
        console.error("jQuery Pdf Export: missing dependency (jspdf.min.js)");
    }
}
