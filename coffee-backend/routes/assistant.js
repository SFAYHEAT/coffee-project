const express = require("express");
const Product = require("../models/Product");
const User = require("../models/User");

const router = express.Router();


// ===============================
// FUZZY MATCH ENGINE
// ===============================

function levenshtein(a, b) {
  const dp = Array.from(
    { length: a.length + 1 },
    (_, i) => [i, ...Array(b.length).fill(0)]
  );

  for (let j = 0; j <= b.length; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          :
          1 +
          Math.min(
            dp[i - 1][j],
            dp[i][j - 1],
            dp[i - 1][j - 1]
          );
    }
  }

  return dp[a.length][b.length];
}


function fuzzyIncludes(tokens, words) {
  return tokens.some((token) =>
    words.some(
      (word) =>
        token === word ||
        (token.length > 3 && levenshtein(token, word) <= 2)
    )
  );
}


function tokenize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}



// ===============================
// ENGLISH + FRENCH UNDERSTANDING
// ===============================


const VOCAB = {


  greeting: [
    "hi",
    "hello",
    "hey",
    "salut",
    "bonjour",
    "coucou"
  ],


  goodbye:[
    "bye",
    "goodbye",
    "au revoir",
    "revoir",
    "ciao"
  ],


  thanks:[
    "thanks",
    "thank",
    "merci",
    "thx"
  ],


  joke:[
    "joke",
    "funny",
    "blague",
    "drole",
    "drôle"
  ],



  sweet:[
    "sweet",
    "sucre",
    "sucre",
    "dessert",
    "cake",
    "cookie",
    "cookies",
    "chocolate",
    "chocolat",
    "caramel",
    "vanilla",
    "vanille",
    "brownie",
    "pastry",
    "gateau",
    "gâteau"
  ],



  cold:[
    "cold",
    "froid",
    "iced",
    "ice",
    "glace",
    "frais"
  ],



  hot:[
    "hot",
    "chaud",
    "warm"
  ],



  strong:[
    "strong",
    "fort",
    "intense",
    "espresso",
    "bold",
    "puissant"
  ],



  healthy:[
    "healthy",
    "diet",
    "light",
    "healthy",
    "sain",
    "leger",
    "léger"
  ],



  food:[
    "eat",
    "food",
    "snack",
    "manger",
    "faim",
    "dessert"
  ],



  recommend:[
    "recommend",
    "suggest",
    "idea",
    "choice",
    "conseille",
    "conseil",
    "suggestion"
  ],



  price:[
    "price",
    "prix",
    "cost",
    "cheap",
    "combien"
  ]

};



// ===============================
// BAD WORD FILTER
// ===============================


const BAD_WORDS = [

  // English
  "fuck",
  "fucking",
  "shit",
  "bitch",
  "idiot",
  "stupid",
  "dumb",

  // French
  "merde",
  "pute",
  "putain",
  "connard",
  "con",
  "salope",
  "encule",
  "enculé"

];



function containsBadWords(message){

  const text = message
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"");


  return BAD_WORDS.some(word =>
    text.includes(word)
  );
}



// ===============================
// BLOCK TIME CALCULATOR
// ===============================


function getBlockTime(warnings){

  if(warnings === 1)
    return 2 * 60 * 1000;


  if(warnings === 2)
    return 5 * 60 * 1000;


  if(warnings >= 3)
    return 60 * 60 * 1000;


  return 0;
}

// ===============================
// PRODUCT INTELLIGENCE
// ===============================


// Creates a searchable text from a product
function productText(product){

  return [
    product.name,
    product.category,
    product.description,
    product.origin,
    product.roastLevel,
    ...(product.tastingNotes || [])
  ]
  .join(" ")
  .toLowerCase();

}



// Check if product matches keywords
function productMatches(product, keywords){

  const text = productText(product);

  return keywords.some(word =>
    text.includes(word)
  );

}



// Score products instead of random filtering
function scoreProduct(product, tokens, preferences){

  let score = 0;

  const text = productText(product);



  // User words
  tokens.forEach(token=>{

    if(text.includes(token)){
      score += 5;
    }

  });



  // ==========================
  // DESSERT REQUEST
  // ==========================

  if(preferences.dessert){


    if(
      /cookie|cookies|cake|dessert|brownie|donut|pastry|biscuit|gateau|gâteau/
      .test(text)
    ){

      score += 200;

    }


    // punish drinks
    if(
      /espresso|coffee|latte|cappuccino|americano|tea/
      .test(text)
    ){

      score -= 100;

    }

  }





  // ==========================
  // SWEET REQUEST
  // ==========================

  if(preferences.sweet){


    if(
      /caramel|vanilla|chocolate|sweet|dessert/
      .test(text)
    ){

      score += 30;

    }


  }




  // ==========================
  // STRONG COFFEE
  // ==========================

  if(preferences.strong){


    if(
      /espresso|americano|bold|strong|dark roast|intense/
      .test(text)
    ){

      score += 50;

    }

  }




  // ==========================
  // COLD
  // ==========================

  if(preferences.cold){


    if(
      /iced|cold|frappe|smoothie|juice/
      .test(text)
    ){

      score += 50;

    }

  }




  // rating boost
  if(product.rating){

    score += product.rating;

  }



  return score;

}




// ===============================
// SMART SEARCH
// ===============================


function findBestProducts(products, tokens, preferences){


  let results = products.map(product=>({

    product,

    score:scoreProduct(
      product,
      tokens,
      preferences
    )

  }));



  results.sort((a,b)=>
    b.score-a.score
  );



  return results
    .filter(x=>x.score>0)
    .slice(0,5)
    .map(x=>x.product);

}





// ===============================
// INTENT DETECTION
// ===============================


function detectIntent(tokens){

  const text = tokens.join(" ");


  return {

    sweet:
      fuzzyIncludes(
        tokens,
        VOCAB.sweet
      ),


    // NEW: sweet food specifically
    dessert:
      fuzzyIncludes(
        tokens,
        [
          "cookie",
          "cookies",
          "cake",
          "gâteau",
          "gateau",
          "brownie",
          "donut",
          "dessert",
          "pastry",
          "biscuit",
          "biscuit"
        ]
      ),


    // NEW: sweet drink specifically
    sweetDrink:
      fuzzyIncludes(
        tokens,
        [
          "caramel",
          "vanilla",
          "vanille",
          "mocha",
          "chocolate",
          "chocolat",
          "latte"
        ]
      ),


    cold:
      fuzzyIncludes(
        tokens,
        VOCAB.cold
      ),


    hot:
      fuzzyIncludes(
        tokens,
        VOCAB.hot
      ),


    strong:
      fuzzyIncludes(
        tokens,
        VOCAB.strong
      ),


    healthy:
      fuzzyIncludes(
        tokens,
        VOCAB.healthy
      ),


    food:
      fuzzyIncludes(
        tokens,
        VOCAB.food
      ),


    recommend:
      fuzzyIncludes(
        tokens,
        VOCAB.recommend
      )

  };

}





// ===============================
// JOKES
// ===============================


const JOKES=[

"Why did the coffee file a police report? It got mugged ☕",

"Espresso yourself before you wreck yourself ☕",

"Life happens, coffee helps ☕",

"I like my coffee like my code — dark and bug free"

];





// ===============================
// PRODUCT RESPONSE BUILDER
// ===============================


function formatProducts(products){
  return products.map(p=>({
    _id: p._id,
    name: p.name,
    price: p.price,
    category: p.category,
    description: p.description || "A delicious choice!",
    imageUrl: p.imageUrl || null
  }));
}
// ===============================
// MAIN ASSISTANT ROUTE
// ===============================


router.post("/ask", async (req,res)=>{


  try{


    const {
      message,
      userId
    } = req.body;



    if(!message){

      return res.status(400).json({
        message:"Message required"
      });

    }



    // ===============================
    // USER MODERATION CHECK
    // ===============================


    if(userId){


      const user = await User.findById(userId);



      if(user){



        // Existing block
        if(
          user.assistantBlockedUntil &&
          new Date(user.assistantBlockedUntil) > new Date()
        ){


          const remaining =
            new Date(user.assistantBlockedUntil).getTime()
            -
            Date.now();



          return res.json({

            blocked:true,

            remaining,

            reply:
            `⚠️ Chat temporarily disabled.
Please wait ${Math.ceil(remaining/60000)} minute(s).`

          });


        }



        // Bad language detected

        if(containsBadWords(message)){



          user.assistantWarnings =
            (user.assistantWarnings || 0) + 1;



          const blockTime =
            getBlockTime(
              user.assistantWarnings
            );



          user.assistantBlockedUntil =
            new Date(
              Date.now()+blockTime
            );



          await user.save();



          return res.json({


            blocked:true,


            warning:user.assistantWarnings,


            duration:blockTime,


            reply:

            `⚠️ Please keep the conversation respectful.
Your chat is blocked for ${Math.ceil(blockTime/60000)} minute(s).`

          });



        }


      }


    }






    // ===============================
    // NORMAL AI PROCESSING
    // ===============================



    const tokens =
      tokenize(message);



    const products =
      await Product.find();



    const intent =
      detectIntent(tokens);





    let reply="";

    let suggestions=[];




    // Greetings

    if(
      fuzzyIncludes(
        tokens,
        VOCAB.greeting
      )
      &&
      tokens.length<=3
    ){


      reply=
      "Hello ☕ I'm your coffee assistant. Tell me what you want: something sweet, strong, cold, or a recommendation.";


    }




    // Thanks

    else if(
      fuzzyIncludes(
        tokens,
        VOCAB.thanks
      )
    ){


      reply=
      "You're welcome ☕ Enjoy your drink!";


    }





    // Goodbye

    else if(
      fuzzyIncludes(
        tokens,
        VOCAB.goodbye
      )
    ){


      reply=
      "See you soon! ☕";


    }





    // Joke

    else if(
      fuzzyIncludes(
        tokens,
        VOCAB.joke
      )
    ){


      reply=
      JOKES[
        Math.floor(
          Math.random()*JOKES.length
        )
      ];


    }





    // Product mentioned directly

    else{


      const mentioned =
      products.find(product=>{


        const words =
        product.name
        .toLowerCase()
        .split(" ");



        return tokens.some(token=>

          words.some(word=>

            token===word ||

            (
              token.length>3 &&
              levenshtein(token,word)<=2
            )

          )

        );


      });




      if(mentioned){



        reply=
        `${mentioned.name} costs ${mentioned.price}.
${mentioned.description || "A great choice!"}`;


        suggestions =
        formatProducts([
          mentioned
        ]);



      }



      else{


        // Smart search

        const results =
        findBestProducts(
          products,
          tokens,
          intent
        );





        if(results.length){



          suggestions =
          formatProducts(results);




         if(intent.dessert){

 reply =
 "I found these sweet treats for you 🍪";

}

else if(intent.sweet){

 reply =
 "Here are some sweet choices you might like ☕";

}


          else if(intent.cold){


            reply=
            "Here are some refreshing cold choices 🧊";


          }


          else if(intent.strong){


            reply=
            "For a stronger coffee experience ☕";


          }


          else if(intent.healthy){


            reply=
            "Here are some lighter options 🌱";


          }


          else{


            reply=
            "I think these choices match what you are looking for ☕";


          }



        }



        else{


          // No product found


          if(intent.sweet){


            reply=
            "Sorry, we don't have sweet products available at the moment 🍰. Would you like a sweet drink instead?";


          }


          else if(intent.cold){


            reply=
            "I couldn't find a cold option right now. Would you like me to show our available drinks?";


          }


          else{


            reply=
            "I couldn't find a matching product. Try asking for something sweet, strong, cold, healthy, or a specific drink.";


          }


        }


      }


    }




    res.json({

      reply,

      suggestions,

      blocked:false

    });



  }

  catch(err){


    console.error(err);


    res.status(500).json({

      message:err.message

    });


  }



});



module.exports = router;
// ===============================
// EXTRA SMART FALLBACK ENGINE
// ===============================


// Detect alternative suggestions
function getAlternativeProducts(products, intent){


  let alternatives=[];



  if(intent.sweet){


    alternatives =
    products.filter(p=>

      /latte|chocolate|vanilla|caramel|mocha|frappe/i
      .test(productText(p))

    );


  }



  if(intent.cold){


    alternatives =
    products.filter(p=>

      /iced|cold|frappe|juice|smoothie/i
      .test(productText(p))

    );


  }



  if(intent.strong){


    alternatives =
    products.filter(p=>

      /espresso|americano|dark|strong/i
      .test(productText(p))

    );


  }



  return alternatives.slice(0,3);

}







// ===============================
// BETTER PRICE SUPPORT
// ===============================


function extractPrice(message){

  const match =
  message.match(
    /(\d+(\.\d+)?)/
  );


  if(!match)
    return null;


  return Number(match[1]);

}







// ===============================
// PRODUCT AVAILABILITY CHECK
// ===============================


function isAvailable(product){


  if(product.stock === undefined)
    return true;


  return product.stock > 0;

}





// ===============================
// ENGLISH / FRENCH FRIENDLY ANSWERS
// ===============================


const FRIENDLY_RESPONSES={


  frenchSweet:
  "Je n'ai pas trouvé de dessert pour le moment 🍰. Voulez-vous essayer une boisson sucrée ?",


  frenchCold:
  "Je n'ai pas trouvé de boisson froide disponible actuellement 🧊.",


  englishSweet:
  "I couldn't find desserts right now 🍰. Would you like a sweet drink instead?",


  englishCold:
  "I couldn't find a cold drink available right now 🧊."


};




// ===============================
// EXPORT EXTRA DATA
// ===============================


router.get("/status",(req,res)=>{


  res.json({

    online:true,

    assistant:
    "Coffee AI Assistant",

    features:[

      "Product recommendations",

      "Sweet drink detection",

      "French and English support",

      "Profanity protection",

      "Smart search"

    ]

  });


});