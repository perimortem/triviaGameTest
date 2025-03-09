// Login Handle
let users = [];
// Fetch users data
fetch('../db/users.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        users = data.users; // Access the nested "users" array
        console.log("Users data loaded:", users); // Check if users array is loaded
    })
    .catch(error => console.error('Error loading user data:', error));

// Match username and password
function matchUsernameToPassword(username, password) {
    console.log("Attempting to match username:", username, "with password:", password);
    
    if (!Array.isArray(users) || users.length === 0) {
        alert("User data not loaded yet. Please try again.");
        console.log("User data not loaded yet");
        return false;
    }

    const user = users.find(user => user.username === username);
    console.log("Found user:", user);
    
    if (user) {
        if (user.password === password) {
            alert("Login successful!");
            console.log("Login successful!");

            // Store user info in session storage
            sessionStorage.setItem('user', JSON.stringify(user));

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
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    console.log("Form submitted with:", { username, password });
    matchUsernameToPassword(username, password);
}


//Trivia Handle


      // The fetchTrivia function from the canvas code
      async function fetchTrivia() {
        try {
            const response = await fetch('https://opentdb.com/api.php?amount=1&type=multiple');
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                const trivia = data.results[0];
                const question = trivia.question;
                const correctAnswer = trivia.correct_answer;
                const incorrectAnswers = trivia.incorrect_answers;
                incorrectAnswers.push(correctAnswer);
                const shuffledAnswers = incorrectAnswers.sort(() => Math.random() - 0.5);
                return {
                    question: question,
                    correctAnswer: correctAnswer,
                    answers: shuffledAnswers
                };
            }
        } catch (error) {
            console.error('Error fetching trivia:', error);
        }
    }

    async function getTrivia() {
        const trivia = await fetchTrivia();
        if (trivia) {
            const questionContainer = document.getElementById('question-container');
            const answerContainer = document.getElementById('answer-container');
    
            questionContainer.innerHTML = `<h2>${trivia.question}</h2>`;
            answerContainer.innerHTML = '';
            trivia.answers.forEach(answer => {
                answerContainer.innerHTML += `<button class="answer" value="${answer}" onClick="checkCorrectAnswer('${answer}', '${trivia.correctAnswer}')">${answer}</button>`;
            });
        }
    }
    
    function checkCorrectAnswer(selectedAnswer, correctAnswer) {
        const resultContainer = document.getElementById('result');

        if (selectedAnswer === correctAnswer) {
            console.log("Correct Answer");
            resultContainer.innerHTML = 'Correct!';
        } else {
            console.log("Incorrect Answer");
            resultContainer.innerHTML = 'Incorrect';
        }
    }