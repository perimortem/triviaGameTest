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
        localStorage.setItem(
          `score_${user.username}`,
          JSON.stringify({ score: 0 })
        );
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
  console.log("Form submitted with:", { username, password }); // debug: check what combination was submitted
  matchUsernameToPassword(username, password);
}

//Game logic and function
// ** Game Logic ** //
let correctAnswer = ""; // Store correct answer globally

async function fetchTrivia(retryCount = 0) {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get("category");
    console.log("Fetched Category from URL:", category);

    let apiUrl = "https://opentdb.com/api.php?amount=1&type=multiple";

    const categoryMap = {
      "General Knowledge": 9,
      Science: 17,
      Movies: 11,
      Games: 15,
      Actors: 26,
      Fantasy: 31,
      Technology: 18,
      History: 23,
      Geography: 22,
      Music: 12,
      Sports: 21,
    };

    const categoryId = categoryMap[category];
    if (categoryId) {
      apiUrl += `&category=${categoryId}`;
      console.log("API URL with Category:", apiUrl);
    }

    const response = await fetch(apiUrl);

    // Check for 429 error (Too Many Requests)
    if (response.status === 429) {
      const retryDelay = Math.pow(2, retryCount) * 1000; // Exponential backoff
      console.warn(`Too many requests! Retrying in ${retryDelay / 1000} seconds...`);
      if (retryCount < 5) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        return fetchTrivia(retryCount + 1); // Retry the request
      } else {
        throw new Error("API is rate-limited. Please try again later.");
      }
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const trivia = data.results[0];
      const question = trivia.question;
      const correctAnswer = trivia.correct_answer;
      const incorrectAnswers = trivia.incorrect_answers;

      incorrectAnswers.push(correctAnswer);
      const shuffledAnswers = incorrectAnswers.sort(() => Math.random() - 0.5);

      return { question, correctAnswer, answers: shuffledAnswers };
    }
  } catch (error) {
    console.error("Error fetching trivia:", error);
    document.getElementById("result").innerHTML = "Error fetching trivia. Please try again later.";
  }
}

async function getTrivia() {
  const trivia = await fetchTrivia();
  document.getElementById("result").innerHTML = "";
  document.getElementById("nextRound").style.visibility = "hidden";

  if (trivia) {
    document.getElementById("question-container").innerHTML = trivia.question;
    const answerContainer = document.getElementById("answer-container");
    answerContainer.innerHTML = "";

    trivia.answers.forEach((answer) => {
      answerContainer.innerHTML += `<button class="answer" onclick="checkCorrectAnswer('${answer}')">${answer}</button>`;
    });
// start Timer
startTimer()
  }
}
const timerDisplay = document.getElementById("timer");
let countdown; // Store the interval ID globally

function startTimer() {
  let timeLeft = 3000;

  countdown = setInterval(() => {
    timerDisplay.innerHTML = `${(timeLeft / 1000).toFixed(2)} seconds`;

    if (timeLeft <= 0) {
      clearInterval(countdown);
      timerDisplay.innerHTML = "Time's up!";
      timeUp(); // Call timeUp() when time runs out
    }

    timeLeft -= 10;
  }, 10);
}

function stopTimer() {
  if (countdown) {
    clearInterval(countdown);
    console.log("Timer stopped manually.");
    
  }
}

// ** Answer Checking and Game Logic ** //
function timeUp() {
  document.getElementById("result").innerHTML = "Time is up! Correct answer: " + correctAnswer;
  disableAnswers();
  decreaseHealth();
}

function checkCorrectAnswer(selectedAnswer) {
  const resultContainer = document.getElementById("result");
  if (selectedAnswer === correctAnswer) {
    resultContainer.innerHTML = "Correct!";
    disableAnswers();
    // Increase score (implement score logic here)
  } else {
    resultContainer.innerHTML = "Incorrect!";
    disableAnswers();
    decreaseHealth();
  }
}

// ** Health Management ** //
let playerHealth = 6; // this is the max amount of HP our player has per game

// set health to max health
function resetHealthAndScore() {
  const playerHealthBar = document.getElementById("playerHealthBar");
  playerHealthBar.innerHTML = ""; // Clear 

  for (let i = 0; i < playerHealth; i++) {
    playerHealthBar.innerHTML += '<span class="h2">&#x2665;</span>'; // currently shows hearts, but can be anythign else
  }
}

function decreaseHealth() {
  if (playerHealth > 0) {
    playerHealth--;
    resetHealthAndScore();
    console.log("Player health decreased to:", playerHealth);
  } else {
    console.log("Game Over: Player has no health left!");
  }
}

// start the game with the correct category passed by url from previous screen
function startGame() {
  const selectedCategory = document.getElementById("category").value;
  console.log("Starting game with category:", selectedCategory);
  window.location.href = "question-answer.html?category=" + encodeURIComponent(selectedCategory);
}

// show correct answer, disable other buttons
function disableAnswers() {
  const answers = document.querySelectorAll(".answer");
  answers.forEach((answer) => {
    if (answer.textContent === correctAnswer) {
      answer.classList.add("correct");
    } else {
      answer.disabled = true;
    }
  }
);

  // Show Next Round Button
  const nextRoundButton = document.getElementById("nextRound");
  if (nextRoundButton) {
    nextRoundButton.style.visibility = "visible";
  }
}