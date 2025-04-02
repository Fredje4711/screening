document.addEventListener('DOMContentLoaded', function() {
    // === DOM Elementen ===
    const page1 = document.getElementById('page1');
    const page2 = document.getElementById('page2');
    const form = document.getElementById('diabetes-risk-form');
    const calculateButton = document.getElementById('calculate-button');
    const backButton = document.getElementById('back-to-test-button');

    // BMI Calculator Elementen (Pagina 1)
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    const calculateBmiButton = document.getElementById('calculate-bmi-button');
    const bmiValueSpan = document.getElementById('bmi-value');
    const bmiCategorySpan = document.getElementById('bmi-category');
    const bmiResultDisplay = document.getElementById('bmi-result'); // Container for result

    // Vraag 2 Radio Buttons (voor auto-select)
    const bmiRadioNormal = document.getElementById('bmi-cat-normal-radio');
    const bmiRadioOverweight = document.getElementById('bmi-cat-overweight-radio');
    const bmiRadioObese = document.getElementById('bmi-cat-obese-radio');

    // Resultaat elementen (Pagina 2)
    const finalScoreDisplay = document.getElementById('final-score-display');
    const scoreIndicator = document.getElementById('score-indicator');
    const scoreCategories = document.querySelectorAll('.score-category'); // NodeList

    // === Variabelen ===
    const totalQuestions = 8; // Aantal fieldsets met data-question-id in de hoofd-form
    let calculatedScore = 0;

    // === Functies ===

    // Controleer of alle *risico* vragen zijn beantwoord (exclusief BMI input)
    function checkAllQuestionsAnswered() {
        let answeredCount = 0;
        const fieldsets = form.querySelectorAll('fieldset[data-question-id]');

        fieldsets.forEach(fieldset => {
            if (fieldset.querySelector('input[type="radio"]:checked')) {
                 answeredCount++;
            }
        });
        calculateButton.disabled = (answeredCount < totalQuestions);
    }

    // Bereken de BMI
    function calculateAndDisplayBMI() {
        const heightCm = parseFloat(heightInput.value);
        const weightKg = parseFloat(weightInput.value);

        // Reset resultaat en kleuren
        bmiValueSpan.textContent = '--';
        bmiCategorySpan.textContent = '--';
        bmiCategorySpan.className = ''; // Verwijder oude kleurklassen
        bmiResultDisplay.classList.remove('bmi-result-error'); // Verwijder error stijl


        if (isNaN(heightCm) || isNaN(weightKg) || heightCm <= 0 || weightKg <= 0 || heightCm < 100 || heightCm > 250 || weightKg < 30 || weightKg > 300) {
            bmiCategorySpan.textContent = 'Ongeldige invoer';
            bmiCategorySpan.classList.add('bmi-cat-error');
            bmiResultDisplay.classList.add('bmi-result-error');
            // Deselecteer vraag 2 radios
            [bmiRadioNormal, bmiRadioOverweight, bmiRadioObese].forEach(radio => radio.checked = false);
            form.dispatchEvent(new Event('change')); // Update hoofdknop status
            return; // Stop berekening
        }

        const heightM = heightCm / 100;
        const bmi = weightKg / (heightM * heightM);
        const bmiRounded = bmi.toFixed(1);

        bmiValueSpan.textContent = bmiRounded;

        let category = '';
        let categoryClass = '';
        let autoSelectRadio = null;

        if (bmiRounded < 18.5) {
            category = 'Ondergewicht';
            categoryClass = 'bmi-cat-underweight';
            // Geen directe mapping naar vraag 2, dus deselecteer
             autoSelectRadio = null; // Of zet op 'normaal'? Hangt van de test af. Laten we het leeg.
        } else if (bmiRounded < 25) {
            category = 'Normaal';
            categoryClass = 'bmi-cat-normal';
            autoSelectRadio = bmiRadioNormal;
        } else if (bmiRounded < 30) {
            category = 'Overgewicht';
            categoryClass = 'bmi-cat-overweight';
            autoSelectRadio = bmiRadioOverweight;
        } else { // bmi >= 30
            category = 'Obesitas';
            categoryClass = 'bmi-cat-obese';
            autoSelectRadio = bmiRadioObese;
        }

        bmiCategorySpan.textContent = category;
        bmiCategorySpan.classList.add(categoryClass);

        // Auto-selecteer de radio button voor Vraag 2
         // Deselecteer eerst de anderen
         [bmiRadioNormal, bmiRadioOverweight, bmiRadioObese].forEach(radio => {
            if (radio !== autoSelectRadio) radio.checked = false;
         });
         // Selecteer de juiste (als er een is)
         if(autoSelectRadio) {
            autoSelectRadio.checked = true;
         }

        // Trigger change event op het hoofdformulier om de knop te updaten
        form.dispatchEvent(new Event('change'));
    }


    // Bereken de totale risicoscore
    function calculateTotalRiskScore() {
        let score = 0;

        const checkedRadios = form.querySelectorAll('input[type="radio"]:checked');
        checkedRadios.forEach(radio => {
            const value = parseInt(radio.value || radio.dataset.genderPoints, 10); // Pak value of data-gender-points
            if (!isNaN(value)) {
                score += value;
            }
        });
        return score;
    }

    // Update de resultaten op pagina 2
    function displayResults(score) {
        finalScoreDisplay.textContent = `${score} p.`;
        const maxScore = 26;
        let scorePercentage = Math.max(0, Math.min(100, (score / maxScore) * 100));
        scoreIndicator.style.top = `${scorePercentage}%`;
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
            page1.classList.remove('hidden'); page1.classList.add('visible');
            page2.classList.add('hidden'); page2.classList.remove('visible');
        } else if (pageToShow === 'page2') {
            page2.classList.remove('hidden'); page2.classList.add('visible');
            page1.classList.add('hidden'); page1.classList.remove('visible');
            window.scrollTo(0, 0);
        }
    }


    // === Event Listeners ===

    // Controleer hoofdknop bij elke wijziging in risicoformulier
    form.addEventListener('change', checkAllQuestionsAnswered);

    // Bereken BMI bij klikken op BMI knop
    calculateBmiButton.addEventListener('click', calculateAndDisplayBMI);
     // Bereken BMI ook bij Enter in een van de input velden
     [heightInput, weightInput].forEach(input => {
        input.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); // Voorkom standaard form submit (niet echt nodig hier, maar goede gewoonte)
                calculateAndDisplayBMI();
            }
        });
     });


    // Bereken risicoscore en toon resultaten bij klikken op hoofdknop
    calculateButton.addEventListener('click', () => {
        calculatedScore = calculateTotalRiskScore();
        displayResults(calculatedScore);
        showPage('page2');
    });

    // Ga terug naar de test
    backButton.addEventListener('click', () => {
        showPage('page1');
    });

    // === Initialisatie ===
    checkAllQuestionsAnswered(); // Check bij laden pagina

});