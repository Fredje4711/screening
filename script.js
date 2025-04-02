document.addEventListener('DOMContentLoaded', function() {
    // === DOM Elementen ===
    const page1 = document.getElementById('page1');
    const page2 = document.getElementById('page2');
    const form = document.getElementById('diabetes-risk-form');
    const calculateButton = document.getElementById('calculate-button');
    const backButton = document.getElementById('back-to-test-button');

    // Resultaat elementen (Pagina 2)
    const finalScoreDisplay = document.getElementById('final-score-display');
    const scoreIndicator = document.getElementById('score-indicator');
    const scoreCategories = document.querySelectorAll('.score-category'); // NodeList

    // === Variabelen ===
    const totalQuestions = 8; // Aantal fieldsets met data-question-id
    let calculatedScore = 0;

    // === Functies ===

    // Controleer of alle vragen zijn beantwoord
    function checkAllQuestionsAnswered() {
        let answeredCount = 0;
        const fieldsets = form.querySelectorAll('fieldset[data-question-id]');

        fieldsets.forEach(fieldset => {
            // Speciale check voor buikomtrek (meerdere names mogelijk)
            if (fieldset.querySelector('input[name="buikomtrek"]:checked') ||
                fieldset.querySelector('input[name="buikomtrek_vrouw"]:checked') ||
                fieldset.querySelector('input[name="buikomtrek_man"]:checked')) {
                 answeredCount++;
            }
             // Voor andere vragen met unieke naam per fieldset
             else if (fieldset.querySelector('input[type="radio"]:checked')) {
                 answeredCount++;
            }
        });

        //console.log(`Answered: ${answeredCount}/${totalQuestions}`); // Debug log
        calculateButton.disabled = (answeredCount < totalQuestions);
    }

    // Bereken de totale score
    function calculateTotalScore() {
        let score = 0;
        let waistScore = 0;

        // Standaard radio buttons (niet buikomtrek man/vrouw specifieke)
        const standardRadios = form.querySelectorAll('input[type="radio"]:checked:not([name^="buikomtrek_"])');
        standardRadios.forEach(radio => {
            const value = parseInt(radio.value, 10);
            if (!isNaN(value)) {
                score += value;
            }
        });

        // Buikomtrek apart
        const waistRadioMan = form.querySelector('input[name="buikomtrek_man"]:checked');
        const waistRadioVrouw = form.querySelector('input[name="buikomtrek_vrouw"]:checked');
        // De <80/<94 optie telt al mee bij standardRadios via name="buikomtrek"

        if (waistRadioMan) {
            waistScore = parseInt(waistRadioMan.dataset.genderPoints, 10) || 0;
        } else if (waistRadioVrouw) {
            waistScore = parseInt(waistRadioVrouw.dataset.genderPoints, 10) || 0;
        }
        score += waistScore; // Voeg buikomtrek score toe indien van toepassing

        //console.log(`Calculated Score: ${score}`); // Debug log
        return score;
    }

    // Update de resultaten op pagina 2
    function displayResults(score) {
        // 1. Toon score
        finalScoreDisplay.textContent = `${score} p.`;

        // 2. Update indicator positie
        const maxScore = 26; // Max score volgens de meter
        let scorePercentage = Math.max(0, Math.min(100, (score / maxScore) * 100));
        // Omgekeerde schaal: 0 is bovenaan (0%), 26 is onderaan (100%)
        scoreIndicator.style.top = `${scorePercentage}%`;

        // 3. Highlight categorie & verwijder oude highlights
        scoreCategories.forEach(cat => cat.classList.remove('highlight-score'));

        if (score <= 6) {
            document.getElementById('score-range-0-6')?.classList.add('highlight-score');
        } else if (score <= 11) {
            document.getElementById('score-range-7-11')?.classList.add('highlight-score');
        } else {
            document.getElementById('score-range-12plus')?.classList.add('highlight-score');
        }
    }

    // Wissel tussen pagina's
    function showPage(pageToShow) {
        if (pageToShow === 'page1') {
            page1.classList.remove('hidden');
            page1.classList.add('visible');
            page2.classList.add('hidden');
            page2.classList.remove('visible');
        } else if (pageToShow === 'page2') {
            page2.classList.remove('hidden');
            page2.classList.add('visible');
            page1.classList.add('hidden');
            page1.classList.remove('visible');
             window.scrollTo(0, 0); // Scroll naar boven bij tonen resultaat
        }
    }


    // === Event Listeners ===

    // Controleer of knop geactiveerd mag worden bij elke wijziging in het formulier
    form.addEventListener('change', checkAllQuestionsAnswered);

    // Bereken score en toon resultaten bij klikken op knop
    calculateButton.addEventListener('click', () => {
        calculatedScore = calculateTotalScore();
        displayResults(calculatedScore);
        showPage('page2');
    });

    // Ga terug naar de test
    backButton.addEventListener('click', () => {
        showPage('page1');
         // Optioneel: reset highlights op pagina 2?
         // scoreCategories.forEach(cat => cat.classList.remove('highlight-score'));
         // scoreIndicator.style.top = '100%';
    });

    // === Initialisatie ===
    checkAllQuestionsAnswered(); // Check bij laden pagina (voor het geval van browser auto-fill)

});