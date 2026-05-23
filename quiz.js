const questions = [
    {
        q: "What does the term 'Blue Zone' refer to?",
        options: ["Regions with the highest cancer rates","Regions where people live significantly longer than average","Areas with high altitude and cold climate","Zones with the purest drinking water"],
        answer: 1,
        info: "Blue Zones are regions identified by researcher Dan Buettner where people consistently live past 100 at remarkable rates. The name comes from the blue circles researchers drew on maps while studying these areas."
    },
    {
        q: "Which of these is NOT one of the original five Blue Zones?",
        options: ["Okinawa, Japan","Sardinia, Italy","Iceland","Nicoya Peninsula, Costa Rica"],
        answer: 2,
        info: "The five original Blue Zones are Okinawa (Japan), Sardinia (Italy), Nicoya (Costa Rica), Icaria (Greece), and Loma Linda (California). Iceland, despite its healthy population, is not among them."
    },
    {
        q: "What is 'Ikigai', a concept central to longevity in Okinawa?",
        options: ["A reason for being or sense of purpose","A traditional herbal tea","A low-calorie diet practice","A morning stretching routine"],
        answer: 0,
        info: "Ikigai (生き甲斐) translates roughly as 'a reason to get up in the morning'. Okinawan centenarians all have a clear sense of purpose, which researchers link to lower stress and longer life."
    },
    {
        q: "What dietary pattern is common across most Blue Zones?",
        options: ["High protein, meat-heavy diet","Raw food only","Intermittent fasting every other day","Plant-based diet with occasional meat"],
        answer: 3,
        info: "Blue Zone diets are predominantly plant-based — beans, lentils, greens, and whole grains form the core. Meat is eaten occasionally (a few times per month) as a side dish rather than a main."
    },
    {
        q: "What is the Okinawan practice of 'Hara Hachi Bu'?",
        options: ["Eating only twice a day","Stopping eating when 80% full","Fasting one day per week","Chewing each bite 30 times"],
        answer: 1,
        info: "Hara hachi bu is a Confucian teaching reminding people to eat until 80% full. It takes ~20 minutes for the brain to register satiety, so stopping before feeling full naturally reduces caloric intake."
    }
];

let current = 0, score = 0;

const progressFill = document.getElementById('progress');
const qLabel       = document.getElementById('q-label');
const qText        = document.getElementById('q-text');
const optsList     = document.getElementById('opts');
const infoPanel    = document.getElementById('info-panel');
const nextBtn      = document.getElementById('next-btn');
const quizPanel    = document.getElementById('quiz-panel');
const scoreCard    = document.getElementById('score-card');

function loadQuestion() {
    optsList.style.pointerEvents = ''; 
    const q = questions[current];
    progressFill.style.width = (current / questions.length * 100) + '%';
    qText.textContent  = q.q;

    optsList.innerHTML = q.options.map((o, i) => `
        <label class="option-label" id="opt-${i}">
        <input type="radio" name="q" value="${i}"> ${o}
        </label>
    `).join('');

    optsList.onchange = e => choose(+e.target.value);

    infoPanel.className = 'info-panel';
    infoPanel.textContent = '';
    nextBtn.disabled = true;
}

function choose(idx) {
    optsList.onchange = null; 
    optsList.style.pointerEvents = 'none';

    const correct = questions[current].answer;
    document.getElementById('opt-' + correct).classList.add(idx === correct ? 'correct' : 'reveal-correct');
    if (idx !== correct) document.getElementById('opt-' + idx).classList.add('wrong');

    if (idx === correct) score++;

    infoPanel.innerHTML = `<strong>${idx === correct ? 'Correct!' : 'Not quite.'}</strong> ${questions[current].info}`;
    requestAnimationFrame(() => infoPanel.classList.add('is-visible'));
    nextBtn.disabled = false;
}

nextBtn.addEventListener('click', () => {
    current++;
    if (current < questions.length) {
        loadQuestion();
    } else {
        showScore();
    }
});

function showScore() {
    progressFill.style.width = '100%';
    quizPanel.hidden = true;
    nextBtn.hidden   = true;

    const pct = score / questions.length;
    let desc, badge;
    if (pct === 1) {
        desc  = 'Exceptional! You have deep knowledge of what makes people live longer lives!';
        badge = 'Blue Zone Master';
    } else if (pct >= 0.6) {
        desc  = 'Great work! You understand the core principles of longevity.';
        badge = 'On the Path';
    } else {
        desc  = "Keep studying! A little more effort and you'll be a longevity expert.";
        badge = 'Just Getting Started';
    }

    const r = 54, circ = +(2 * Math.PI * r).toFixed(2);
    const offset = +(circ * (1 - pct)).toFixed(2);

    scoreCard.querySelector('.score-big').innerHTML = `
        <svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="quizGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#38bdf8"/>
                    <stop offset="100%" stop-color="#34d399"/>
                </linearGradient>
            </defs>
            <circle class="score-ring-track" cx="70" cy="70" r="${r}"/>
            <circle class="score-ring-fill" cx="70" cy="70" r="${r}"
                stroke-dasharray="${circ}" stroke-dashoffset="${circ}"/>
        </svg>
        <div class="score-fraction">
            <span class="score-fraction-num">${score}/${questions.length}</span>
            <span class="score-fraction-label">correct</span>
        </div>`;

    scoreCard.querySelector('.score-sub').textContent  = badge;
    scoreCard.querySelector('.level-desc').textContent = desc;
    scoreCard.hidden = false;

    requestAnimationFrame(() => requestAnimationFrame(() => {
        const ring = scoreCard.querySelector('.score-ring-fill');
        if (ring) ring.style.strokeDashoffset = offset;
    }));
}

document.getElementById('btn-restart').addEventListener('click', () => {
    current = 0; score = 0;
    progressFill.style.width = '0%';
    quizPanel.hidden = false;
    nextBtn.hidden   = false;
    scoreCard.hidden = true;
    loadQuestion();
});

loadQuestion();