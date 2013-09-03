(function() {
    var MAX_SENT = 100;
    var MIN_SENT = 0;
    var TIMEOUT = 15000;
    var loadingImg = '<img id="loadingImage" src="/static/img/ajax-loader.gif" />';
    var scaleSentiment = function(score) {
        var scaled = (MAX_SENT - MIN_SENT) * (score - (-1.0)) / (1 - (-1));
        return Math.round(scaled);
    };

    var getSentimentText = function(score) {
        if (score <= -0.70){
            return {text: "Very negative", css: "very-negative"};
        } else if (score <= -0.2){
            return {text: "Negative", css: "negative"};
        } else if (score >= 0.70){
            return {text: "Very positive", css: "very-positive"};
        } else if (score >= 0.2){
            return {text: "Positive", css: "positive"};
        } else{
            return {text: "Neutral", css: "neutral"};
        }
    };

    var getSentimentElement = function(score){
        var text = getSentimentText(score);
        var elem = "<span class='sentiment " + text.css + "'>" +
        text.text +  " (" + scaleSentiment(score) + ")" +
        "</span>";
        return elem;
    };

    var errored = function(xml, status, message, $elem){
        if (status === "timeout"){
            $elem.html("Timed out. Try again.");
        } else {
            $elem.html("Something went wrong. Try again.");
        }
        return null;
    };

    var updateValue = function(url, text, $elem, success){
        $elem.append(loadingImg);
        $.ajax({
            url: url,
            type: "POST",
            timeout: TIMEOUT,
            data: {"text": text},
            dataType: "json",
            success: success,
            error: function(xml, status, message){
                errored(xml, status, message, $elem);
            }
        });
    };

    var updateNounPhrases = function(text){
        $nounList = $("#nounPhrasesValue");
        updateValue("/api/noun_phrases", text, $nounList, function(res){
            $nounList.empty();
            var nounPhrases = res.result;
            if (!text) {
                $nounList.append("No text.");
            }
            else if (nounPhrases.length <= 0){
                $nounList.append("<em>None found.</em>");
            } else{
                nounPhrases.forEach(function(elem, index) {
                    $nounList.append("<li>" + elem + "</li>");
                });
            }
        });
    };

    var updateSentiment = function(text){
        $sentValue = $("#sentimentValue");
        $("#sentencesSentiment").hide();
        updateValue("/api/sentiment", text, $sentValue, function(res) {
            $sentValue.empty();
            if (!text){
                $("#breakdown").hide();
                $sentValue.append("<em>No text.</em>");
            } else {
                $sentValue.append(getSentimentElement(res.result));
                $("#breakdown").show();
            }
        });
    };

    // Event handlers
    var timeout;
    $("#text").on("paste input", function() {
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            var text = $("textarea[name='text']")[0].value;
            updateSentiment(text);
            updateNounPhrases(text);
        }, 250);
    });

    var toggleSentences = function() {
        var $sentDiv = $("#sentencesSentiment");
        $sentBtn = $("#breakdownBtn");
        if ($sentDiv.is(":visible")){
            $sentDiv.hide();
            $sentBtn.removeClass("active");
        } else{
            var text = $("textarea[name='text']")[0].value;
            $sentDiv.show();
            var $sentTable = $("#sentencesSentiment table");
            var $tbody = $sentTable.children("tbody");
            updateValue("/api/sentiment/sentences", text, $tbody, function(res){
                $sentBtn.addClass("active");
                $tbody.empty();
                var sentences = res.result;
                if (sentences.length <= 0){
                    $sentTable.append("No sentences.");
                } else {
                    sentences.forEach(function(elem, index){
                        $tbody.append("<tr>" +
                            "<td>" + elem.sentence + "</td>" +
                            "<td>" + getSentimentElement(elem.sentiment) + "</td>" +
                            "</tr>");
                    });
                }
            });
        }
    };

    $("#breakdown").on('click', function(e){
        e.preventDefault();
        toggleSentences();
    });
}).call(this);
