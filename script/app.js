// Login Handle
let users = [];
// Fetch users data
fetch("../db/users.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    users = data.users; // Access the nested "users" array
    console.log("Users data loaded:", users); // Check if users array is loaded
  })
  .catch((error) => console.error("Error loading user data:", error));

// Match username and password
function matchUsernameToPassword(username, password) {
  console.log(
    "Attempting to match username:",
    username,
    "with password:",
    password
  );

  if (!Array.isArray(users) || users.length === 0) {
    alert("User data not loaded yet. Please try again.");
    console.log("User data not loaded yet");
    return false;
  }

  const user = users.find((user) => user.username === username);
  console.log("Found user:", user);

  if (user) {
    if (user.password === password) {
      alert("Login successful!");
      console.log("Login successful!");

      // Store user info in session storage
      sessionStorage.setItem("user", JSON.stringify(user));

      // Redirect to the next page
      window.location.href = "choose-action.html";
      return true;
    } else {
      alert("Incorrect password.");
      console.log("Incorrect password.");
      return false;
    }
  } else {
    alert("Username not found.");
    console.log("Username not found.");
    return false;
  }
}

// Form handling
function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  console.log("Form submitted with:", { username, password });
  matchUsernameToPassword(username, password);
}

//Trivia Handle

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

    questionContainer.innerHTML = `<h2>${trivia.question}</h2>`;
    answerContainer.innerHTML = "";
    trivia.answers.forEach((answer) => {
      answerContainer.innerHTML += `<button class="answer" value="${answer}" onClick="checkCorrectAnswer('${answer}', '${trivia.correctAnswer}')">${answer}</button>`;
    });
  }
}

function checkCorrectAnswer(selectedAnswer, correctAnswer) {
  const resultContainer = document.getElementById("result");

  if (selectedAnswer === correctAnswer) {
    console.log("Correct Answer");
    resultContainer.innerHTML = "Correct!";
  } else {
    console.log("Incorrect Answer");
    resultContainer.innerHTML = "Incorrect";
  }
}


//  Initiate game from Category Screen and pass the category through the url.

function startGame() {
    const selectedCategory = document.getElementById("category").value;
    console.log("Selected Category:", selectedCategory); // Debugging line
    window.location.href =
      "question-answer.html?category=" + encodeURIComponent(selectedCategory);
  }