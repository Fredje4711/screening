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
    const bmiResultDisplay = document.getElementById('bmi-result');

    // Vraag 2 Radio Buttons (voor auto-select)
    const bmiRadioNormal = document.getElementById('bmi-cat-normal-radio');
    const bmiRadioOverweight = document.getElementById('bmi-cat-overweight-radio');
    const bmiRadioObese = document.getElementById('bmi-cat-obese-radio');

    // Resultaat elementen (Pagina 2)
    const finalScoreDisplay = document.getElementById('final-score-display');
    const scoreIndicator = document.getElementById('score-indicator');
    const scoreCategories = document.querySelectorAll('.score-category');

    // === Variabelen ===
    const totalQuestions = 8;
    let calculatedScore = 0;

    // === Functies ===

    // Controleer of alle *risico* vragen zijn beantwoord
    function checkAllQuestionsAnswered() {
        let answeredCount = 0;
        const fieldsets = form.querySelectorAll('fieldset[data-question-id]');
        fieldsets.forEach(fieldset => {
            // Check of *enige* radio binnen de fieldset is aangevinkt
            if (fieldset.querySelector('input[type="radio"]:checked')) {
                 answeredCount++;
            }
        });
        calculateButton.disabled = (answeredCount < totalQuestions);
    }

    // Bereken de BMI
    function calculateAndDisplayBMI() {
        console.log("calculateAndDisplayBMI called"); // Debug log
        try {
            const heightCm = parseFloat(heightInput.value);
            const weightKg = parseFloat(weightInput.value);

            bmiValueSpan.textContent = '--';
            bmiCategorySpan.textContent = '--';
            bmiCategorySpan.className = '';
            bmiResultDisplay.classList.remove('bmi-result-error');

            if (isNaN(heightCm) || isNaN(weightKg) || heightCm <= 0 || weightKg <= 0 || heightCm < 100 || heightCm > 250 || weightKg < 30 || weightKg > 300) {
                console.log("Invalid BMI input"); // Debug log
                bmiCategorySpan.textContent = 'Ongeldige invoer';
                bmiCategorySpan.classList.add('bmi-cat-error');
                bmiResultDisplay.classList.add('bmi-result-error');
                [bmiRadioNormal, bmiRadioOverweight, bmiRadioObese].forEach(radio => radio.checked = false);
                form.dispatchEvent(new Event('change'));
                return;
            }

            const heightM = heightCm / 100;
            const bmi = weightKg / (heightM * heightM);
            const bmiRounded = bmi.toFixed(1);
            console.log("Calculated BMI:", bmiRounded); // Debug log

            bmiValueSpan.textContent = bmiRounded;

            let category = '';
            let categoryClass = '';
            let autoSelectRadio = null;

            if (bmiRounded < 18.5) {
                category = 'Ondergewicht'; categoryClass = 'bmi-cat-underweight'; autoSelectRadio = null;
            } else if (bmiRounded < 25) {
                category = 'Normaal'; categoryClass = 'bmi-cat-normal'; autoSelectRadio = bmiRadioNormal;
            } else if (bmiRounded < 30) {
                category = 'Overgewicht'; categoryClass = 'bmi-cat-overweight'; autoSelectRadio = bmiRadioOverweight;
            } else {
                category = 'Obesitas'; categoryClass = 'bmi-cat-obese'; autoSelectRadio = bmiRadioObese;
            }

            bmiCategorySpan.textContent = category;
            bmiCategorySpan.classList.add(categoryClass);

            // Auto-select Vraag 2 radio
            [bmiRadioNormal, bmiRadioOverweight, bmiRadioObese].forEach(radio => { radio.checked = (radio === autoSelectRadio); });

            form.dispatchEvent(new Event('change')); // Update hoofdknop status

        } catch (error) {
            console.error("Error in calculateAndDisplayBMI:", error); // Log errors
            bmiCategorySpan.textContent = 'Fout bij berekenen';
            bmiCategorySpan.classList.add('bmi-cat-error');
            bmiResultDisplay.classList.add('bmi-result-error');
        }
    }


    // === GECORRIGEERDE Score Berekening ===
    function calculateTotalRiskScore() {
        let score = 0;
        console.log("--- Calculating Risk Score ---"); // Debug

        // 1. Score van vragen 1, 2, 4, 5, 6, 7, 8 (NIET Buikomtrek)
        const standardRadios = form.querySelectorAll(
            'input[name="leeftijd"]:checked, ' +
            'input[name="gewicht"]:checked, ' + // Vraag 2 (BMI categorie)
            'input[name="beweging"]:checked, ' +
            'input[name="voeding"]:checked, ' +
            'input[name="bloeddruk"]:checked, ' +
            'input[name="bloedsuiker"]:checked, ' +
            'input[name="erfelijkheid"]:checked'
        );

        standardRadios.forEach(radio => {
            const value = parseInt(radio.value, 10);
            if (!isNaN(value)) {
                score += value;
                console.log(`+${value} points from ${radio.name}`); // Debug
            } else {
                 console.warn(`NaN value found for ${radio.name}`); // Debug
            }
        });

        // 2. Score van vraag 3 (Buikomtrek) expliciet
        const waistRadioGeneral = form.querySelector('input[name="buikomtrek"]:checked');
        const waistRadioVrouw = form.querySelector('input[name="buikomtrek_vrouw"]:checked');
        const waistRadioMan = form.querySelector('input[name="buikomtrek_man"]:checked');

        let waistValue = 0;
        if (waistRadioVrouw) {
            waistValue = parseInt(waistRadioVrouw.dataset.genderPoints, 10);
            console.log(`Buikomtrek Vrouw selected: data-gender-points=${waistRadioVrouw.dataset.genderPoints}`); // Debug
        } else if (waistRadioMan) {
            waistValue = parseInt(waistRadioMan.dataset.genderPoints, 10);
             console.log(`Buikomtrek Man selected: data-gender-points=${waistRadioMan.dataset.genderPoints}`); // Debug
        } else if (waistRadioGeneral) {
            waistValue = parseInt(waistRadioGeneral.value, 10); // Zou 0 moeten zijn
             console.log(`Buikomtrek Algemeen selected: value=${waistRadioGeneral.value}`); // Debug
        } else {
             console.warn("No Buikomtrek option selected?"); // Debug
        }

        if (!isNaN(waistValue)) {
            score += waistValue;
            console.log(`+${waistValue} points from Buikomtrek`); // Debug
        } else {
             console.warn(`NaN value found for Buikomtrek`); // Debug
        }


        console.log(`=== Total Calculated Score: ${score} ===`); // Debug
        return score;
    }
    // === EINDE GECORRIGEERDE Score Berekening ===


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
    if (calculateBmiButton) {
         calculateBmiButton.addEventListener('click', calculateAndDisplayBMI);
         console.log("BMI button event listener attached"); // Debug
    } else {
         console.error("BMI Calculate Button not found!"); // Debug
    }

     // Bereken BMI ook bij Enter in een van de input velden
     [heightInput, weightInput].forEach(input => {
        if(input) {
            input.addEventListener('keypress', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    calculateAndDisplayBMI();
                }
            });
        } else {
             console.error("Height or Weight input not found!"); // Debug
        }
     });


    // Bereken risicoscore en toon resultaten bij klikken op hoofdknop
    calculateButton.addEventListener('click', () => {
        console.log("Main Calculate button clicked"); // Debug
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