// section: Login Handle
// Warning: This section works on local files only - all stored data is stored with browser cache. Will need back end scripts / serverside language to write to a db.
let users = [];


// Warning: This is a breach of security as the "users" variable is exposed to the console/ sources. Fixe before deplyment.
// action: fetch data from db
fetch("../db/users.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`); //debug: error reading db File.
    }
    return response.json();
  })
  .then((data) => {
    users = data.users; 
    console.log("Users data loaded:", users); // debug: are there users loaded?
  })
  .catch((error) => console.error("Error loading user data:", error)); // debig: uesr loading failed.

// action: match username, password, and score.
function matchUsernameToPassword(username, password) {

// debug: check what the call is
  console.log(
    "Attempting to match username:",
    username,
    "with password:",
    password
  );

  // action: find user in the db
  const user = users.find((user) => user.username === username);
  console.log("Found user:", user);

  if (user) {
    if (user.password === password) {
      console.log("Login successful!");

      sessionStorage.setItem("user", JSON.stringify(user));

      // action: check if a score already exists, otherwise initialize it
      // warning: This works on local only, data is stored in browser cache. This will need to be hooked in with backend script. 
      if (!localStorage.getItem(`score_${user.username}`)) {
        localStorage.setItem(`score_${user.username}`, JSON.stringify({ score: 0 }));
      }
      //action: redirect to the next page
      window.location.href = "choose-action.html";
      return true;
    } else {
      alert("Incorrect password."); 
      console.log("Incorrect password."); //debug: notify that the password is wrong
      return false;
    }
  } else {
    alert("Username not found.");
    console.log("Username not found."); //debug: notify that the user does not exist
    return false;
  }
}

// section: Form handling
function handleLogin(event) {
  event.preventDefault(); // ensures user does not use default values, and notifies them they need to put in form data.
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  console.log("Form submitted with:", { username, password });// debug: check what combination was submitted
  matchUsernameToPassword(username, password);
}


//Game logic and function
async function fetchTrivia() {
    try {
      // Get the category from the URL
      const urlParams = new URLSearchParams(window.location.search);
      const category = urlParams.get("category");
      console.log("Fetched Category from URL:", category); // Debugging line
  
      // Define the API endpoint with the selected category
      let apiUrl = "https://opentdb.com/api.php?amount=1&type=multiple";
  
      // Map category names to Open Trivia Database category IDs
      const categoryMap = {
        "General Knowledge": 9,
        "Science": 17,
        "Movies": 11,
        "Games": 15,
        "Actors": 26,
        "Fantasy": 31,
        "Technology": 18,
        "History": 23,
        "Geography": 22,
        "Music": 12,
        "Sports": 21,
      };
  
      // Get the category ID from the mapping if it exists
      const categoryId = categoryMap[category];
      if (categoryId) {
        apiUrl += `&category=${categoryId}`;
        console.log("API URL with Category:", apiUrl); // Debugging line
      }
  
      const response = await fetch(apiUrl);
      const data = await response.json();
  
      if (data.results && data.results.length > 0) {
        const trivia = data.results[0];
        const question = trivia.question;
        const correctAnswer = trivia.correct_answer;
        const incorrectAnswers = trivia.incorrect_answers;
  
        // Combine and shuffle the answers
        incorrectAnswers.push(correctAnswer);
        const shuffledAnswers = incorrectAnswers.sort(() => Math.random() - 0.5);
  
        return {
          question: question,
          correctAnswer: correctAnswer,
          answers: shuffledAnswers,
        };
      }
    } catch (error) {
      console.error("Error fetching trivia:", error);
    }
  }

  async function getTrivia() {
    const trivia = await fetchTrivia();
    if (trivia) {
      const questionContainer = document.getElementById("question-container");
      const answerContainer = document.getElementById("answer-container");
      const timerDisplay = document.getElementById("timer");
  
      questionContainer.innerHTML = `${trivia.question}`;
      answerContainer.innerHTML = "";
  
      trivia.answers.forEach((answer) => {
        answerContainer.innerHTML += `<button class="answer" value="${answer}" onClick="checkCorrectAnswer('${answer}', '${trivia.correctAnswer}')">${answer}</button>`;
      });
      
      // set this value for round timeout
      let timeLeft = 3 * 1000;
  
      const countdown = setInterval(() => {
        timerDisplay.innerHTML = `${(timeLeft / 1000).toFixed(2)} `;
  
        if (timeLeft <= 0) {
          clearInterval(countdown);
          timerDisplay.innerHTML = "Time's up!";
          timeUp(trivia.correctAnswer); // Pass correct answer to timeUp()
        }
        timeLeft -= 10; // Decrement by 10 milliseconds
      }, 10);
    }
  }

  
  //  Win / lose conditions

  // time up (passing correct answer for highlighting)
function timeUp() {
  const answers = document.querySelectorAll(".answer");
    resultContainer.innerHTML = "Time is up! Correct answer is: " + correctAnswer;
disableAnswers();
decreaseHealth();
}

function disableAnswers(correctAnswer){
  const resultContainer = document.getElementById("result");
  answers.forEach((answer) => {
    console.log("Timeup Reading correct answer: " + correctAnswer);
    if (answer.value === correctAnswer) {
      answer.classList.add("correct"); // Highlight correct answer
    } 
    else {
      answer.disabled = true; // Disable other buttons
    }
  }
)
}

function checkCorrectAnswer(selectedAnswer, correctAnswer) {
  const resultContainer = document.getElementById("result");
  if (selectedAnswer === correctAnswer) {
    console.log("Correct Answer");
    resultContainer.innerHTML = "Correct!";
    // add score to player
  } else {
    console.log("Incorrect Answer");
    resultContainer.innerHTML = "Incorrect";
    // Deduct Life from player
    decreaseHealth()
  }
  // Show "next question button"
}
// Define playerHealth globally so it can be accessed anywhere in the script
let playerHealth = 6;

function resetHealthAndScore() {
    const playerHealthBar = document.getElementById("playerHealthBar"); 
    playerHealthBar.innerHTML = '';  // Clear any existing hearts before displaying new ones

    for (let i = 0; i < playerHealth; i++) {
        playerHealthBar.innerHTML += '<span class="h1">&#x2665;</span>';
        console.log("hp:" + (i + 1)); // Display current health number
    }
}

// Example of accessing playerHealth outside the function
function decreaseHealth() {
    if (playerHealth > 0) {
        playerHealth--;
        resetHealthAndScore(); // Update the UI after changing health
        console.log("Player health decreased, current health: " + playerHealth);
    } else {
        console.log("Player has no health left!");
    }
}


//  Initiate game from Category Screen and pass the category through the url
function startGame() {
  // Assume maxHealth is defined somewhere before this function
  let playerHealth = maxHealth;  // Initialize player health to maxHealth
  const selectedCategory = document.getElementById("category").value;
  
  console.log("Selected Category:", selectedCategory); // Debugging line
  console.log("PLayer Health set to", playerHealth); // Debugging line
  // Redirect to the next page with the selected category
  window.location.href = "question-answer.html?category=" + encodeURIComponent(selectedCategory);
}