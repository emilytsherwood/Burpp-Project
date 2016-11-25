$(document).ready(function() {

    // Capture Button Click
    $("#btn-food").on("click", function() {
        // Grabbed values from text boxes
        var fname = $("#food-search").val().trim();
        var loc = $("#location").val().trim();

        fname="pizza";
        loc="60631";

        // yelpQuery(fname, loc, "10");
        // edamamQuery(fname);        

        fakeYelpQuery(fname, loc, "10");
        fakeEdamamQuery(fname);

        return false;
    });

    // Dut to the recipe site edamam being down most of Thanksgiving day, 
    // I saved an edamam query and a yelp query as JSON strings and read
    // them to allow me to continue to develop without depending on these
    // sites responding. So I added 'fake' functions to simulate the 
    // responses
    function fakeEdamamQuery(fname) {
        var response="";
        try {
            response = JSON.parse(edamam_str);
        } catch (err) {
            console.log(err.message);
        }

        $('.div-recipe-area').empty();
        makeRecipeDivHeading();
        for (var i = 0; i < response.hits.length; i++) {
            makeRecipeDiv(response, i);
        }
    }

    function fakeYelpQuery(food, loc, num) {
        var response="";
        try {
            response = JSON.parse(yelp_str);
        } catch (err) {
            console.log(err.message);
        }
        makeYelpDiv(response);
    }
  
    // Capture Button Click
    $(document).on("click", ".btn-save-recipe", function() {
        // Grabbed values from text boxes
        var t = $(this);
        var recipe=$(this).data("recipe");

        return false;
    });
























    function edamamQuery(fname) {
        // The following 4 variables are in the order they need to be 
        // concatenated in var queryURL
        var crossoriginURL = "https://crossorigin.me/";
        var edamamURL = "https://api.edamam.com/search?";
        var search = "q=" + fname;
        var keys = "&app_id=e5ee4c7d&app_key=c8fc66f63a363261369faadc4fdd29ae";

        var queryURL = crossoriginURL + edamamURL + search + keys;

        var config = { url: queryURL, method: 'GET' };
        console.log("url before query: " + queryURL);

        $.ajax({ url: queryURL, method: 'GET' })
            .done(function(response) {
                console.log(".done: " + response);

                $('.div-recipe-area').empty();
                makeRecipeDivHeading();
                for (var i = 0; i < response.hits.length; i++) {
                    makeRecipeDiv(response, i);
                }
            });
    }

    function makeRecipeDivHeading() {
        // Empty out the recipes array
        recipes=[];
        var divRecipeHeading = $('<div class="panel-heading">');
        divRecipeHeading.html('<h3 class="panel-title">Edamam Recipes</h3>');
        $(".div-recipe-area").append(divRecipeHeading);
    }

    function makeRecipeDiv(response, i) {

        var divIndividualRecipe = $('<div class="panel panel-default div-recipe">');
        // divIndividualRecipe is a panel that contains a panel-heading and a panel-body
        var divHeading = $('<div class="panel-heading">');
        var divRecipeBody = $('<div class="panel-body div-recipe-panel-body">');
        // divRecipeBody contains an aside left and an aside right
        var asideLeft = $('<aside class="aside-left-image">');
        var asideRight = $('<aside class="aside-right-recipe-content">');

        var recipe = response.hits[i].recipe;

        var h = $('<h5>').text("Recipe: " + recipe.label);
        h.addClass("h5-title");
        divHeading.append(h);

        var recipeImage = $('<img>');
        recipeImage.addClass("img-food");
        recipeImage.attr('src', recipe.image);
        asideLeft.append(recipeImage);

        var hingr = $('<h5>').text("Ingredients: ");
        asideRight.append(hingr);

        var ingredientList = $('<ol>');

        for (var i = 0; i < recipe.ingredientLines.length; i++) {
            var li = $('<li>').text(recipe.ingredientLines[i]);
            ingredientList.append(li);
            //recipes.push(recipe.url);
        }

        var originalURL = $("<a>").attr("href", recipe.url).attr("target", "_blank").text("Open Full recipe in new window.");

        //btnId = 'id-save-recipe' + i.toString();
        //btnSaveRecipe = $('<button class="btn btn-default btn-save-recipe" id="' + btnId + '" type="submit">Save Recipe</button>');
        btnSaveRecipe = $('<button class="btn btn-default btn-save-recipe" type="submit">Save Recipe</button>');
        btnSaveRecipe.attr("data-recipe", recipe.url);

        asideRight.append(ingredientList);
        asideRight.append(originalURL);
        asideRight.append('<br><br>');
        asideRight.append(btnSaveRecipe);

        divRecipeBody.append(asideLeft);
        divRecipeBody.append(asideRight);

        divIndividualRecipe.append(divHeading).append(divRecipeBody);

        $(".div-recipe-area").append(divIndividualRecipe);
    }

    function yelpQuery(food, loc, num) {

        function cb(data) {
            makeYelpDiv(data);
        }
        // the callback function cb needs to be global, the following line does this
        window.cb = cb;

        var auth = {
            consumerKey: "3EYbFFuD4X44tV01t3Nbiw",
            consumerSecret: "a71F0PmRXr0O1vpRHiIyxaxepYI",
            accessToken: "z-WvclgEHnhaYrCTFVaTPUi5hbw36zxS",
            accessTokenSecret: "8uwuZ5AE3aQpwU3K_PYLXHEOeq4",
            serviceProvider: {
                signatureMethod: "HMAC-SHA1"
            }
        };

        var terms = food;
        var near = loc;
        var accessor = {
            consumerSecret: auth.consumerSecret,
            tokenSecret: auth.accessTokenSecret
        };

        var parameters = [];
        parameters.push(['term', terms]);
        parameters.push(['location', near]);
        parameters.push(['limit', num]);
        parameters.push(['callback', 'cb']);
        parameters.push(['oauth_consumer_key', auth.consumerKey]);
        parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
        parameters.push(['oauth_token', auth.accessToken]);
        parameters.push(['oauth_signature_method', 'HMAC-SHA1']);

        var message = {
            'action': 'http://api.yelp.com/v2/search',
            'method': 'GET',
            'parameters': parameters,
            'dataType': 'jsonp'
        };

        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, accessor);

        var parameterMap = OAuth.getParameterMap(message.parameters);

        $.ajax({
                'url': message.action,
                'data': parameterMap,
                'dataType': 'jsonp',
                'jsonpCallback': 'cb',
                'cache': true
            })
            .done(function(data, textStatus, jqXHR) {
                console.log('success[' + data + '], status[' + textStatus + '], jqXHR[' + JSON.stringify(jqXHR) + ']');
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.log('error[' + errorThrown + '], status[' + textStatus + '], jqXHR[' + JSON.stringify(jqXHR) + ']');
            });
    }

    function makeYelpDivHeading() {
        var divYelpHeading = $('<div class="panel-heading">');
        divYelpHeading.html('<h3 class="panel-title">Yelp Restaurants</h3>');
        $(".div-yelp").append(divYelpHeading);
    }

    // Create div representing all of the businesses from the Yelp response
    // We take the javascript JSON object and 'i', the index number of the business in 
    // the (javascript JSON object).businesses[i]. See the html below this function 
    // to see the structure of the div that will be created
    function makeYelpDiv(jsJsonObj) {
        var str = JSON.stringify(jsJsonObj);
        $('.div-yelp').empty();
        makeYelpDivHeading();
        // For each business returned from the Yelp query
        for (var i = 0; i < jsJsonObj.businesses.length; i++) {
            // Get the individual business data
            var business = jsJsonObj.businesses[i];
            // Create a panel id for each restaurant panel
            var panelId = "collapse" + i.toString();

            // The primary div with a heading and collapsible panel
            var divYelpBusiness = $('<div class="panel panel-default div-yelp-business">');

            // 1.) create div-yelp-heading
            var divYelpHeading = $('<div class="panel-heading div-yelp-heading">');
            var h4 = $('<h4 class="panel-title">');
            var aStr = '<a data-toggle="collapse" href="#' + panelId + '">';
            var a = $(aStr);
            a.text(business.name);
            var rating = $('<img >');
            rating.attr("src", business.rating_img_url);
            var img_restaurant = $('<img >');
            img_restaurant.attr("src", business.image_url);

            h4.append(a);
            divYelpHeading.append(h4);
            divYelpHeading.append(rating);
            divYelpHeading.append('<br>');

            divYelpHeading.append(img_restaurant);
            divYelpBusiness.append(divYelpHeading);
            // 1.) div-yelp-heading complete and appended to div-yelp-business

            // 2.) create div collapse
            var divStr = '<div id="' + panelId + '" class="panel-collapse collapse">';
            var divCollapse = $(divStr);
            var divYelpBody = $('<div class="panel-body div-yelp-body">');
            // BEGIN DISPLAYED RESTAURANT DATA
            //divYelpBody.append(business.name);
            var phone = formatPhone(business.phone);

            divYelpBody.append(phone).append('<br>');
            if (business.neighborhoods !== undefined) {
                for (var j = 0; j < business.location.neighborhoods.length; j++) {
                    divYelpBody.append(business.location.neighborhoods[j]).append('<br>');
                }
            }
            for (var k = 0; k < business.location.display_address.length; k++) {
                divYelpBody.append(business.location.display_address[k]).append('<br>');
            }
            var strURL = $('<a>').attr("href", business.url).append("Yelp Link");
            divYelpBody.append(strURL);
            // END DISPLAYED RESTAURANT DATA

            divCollapse.append(divYelpBody);
            divYelpBusiness.append(divCollapse);
            // 2.) div collapse complete and appended to div-yelp-business

            $(".div-yelp").append(divYelpBusiness);
        }
    }

    /**
     *  Format phone numbers
     */
    function formatPhone(phonenum) {
        var regexObj = /^(?:\+?1[-. ]?)?(?:\(?([0-9]{3})\)?[-. ]?)?([0-9]{3})[-. ]?([0-9]{4})$/;
        if (regexObj.test(phonenum)) {
            var parts = phonenum.match(regexObj);
            var phone = "";
            if (parts[1]) { phone += "+1 (" + parts[1] + ") "; }
            phone += parts[2] + "-" + parts[3];
            return phone;
        } else {
            //invalid phone number
            return phonenum;
        }
    }
});
