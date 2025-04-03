document.addEventListener('DOMContentLoaded', function() {
    // === DOM Elementen ===
    const page1 = document.getElementById('page1');
    const page2 = document.getElementById('page2');
    const form = document.getElementById('diabetes-risk-form');
    const calculateButton = document.getElementById('calculate-button');
    const backButton = document.getElementById('back-to-test-button');
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    const calculateBmiButton = document.getElementById('calculate-bmi-button');
    const bmiValueSpan = document.getElementById('bmi-value');
    const bmiCategorySpan = document.getElementById('bmi-category');
    const bmiResultDisplay = document.getElementById('bmi-result');
    const bmiRadioNormal = document.getElementById('bmi-cat-normal-radio');
    const bmiRadioOverweight = document.getElementById('bmi-cat-overweight-radio');
    const bmiRadioObese = document.getElementById('bmi-cat-obese-radio');
    const finalScoreDisplay = document.getElementById('final-score-display');
    const scoreIndicator = document.getElementById('score-indicator');
    const scoreCategories = document.querySelectorAll('.score-category');

    // === Variabelen ===
    const totalQuestions = 8;
    let calculatedScore = 0;

    // === Functies ===
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

    function calculateAndDisplayBMI() {
        console.log("calculateAndDisplayBMI called");
        try {
            const heightCm = parseFloat(heightInput.value);
            const weightKg = parseFloat(weightInput.value);

            bmiValueSpan.textContent = '--';
            bmiCategorySpan.textContent = '--';
            bmiCategorySpan.className = '';
            bmiResultDisplay.classList.remove('bmi-result-error');

            if (isNaN(heightCm) || isNaN(weightKg) || heightCm <= 0 || weightKg <= 0 || heightCm < 100 || heightCm > 250 || weightKg < 30 || weightKg > 300) {
                console.log("Invalid BMI input");
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
            console.log("Calculated BMI:", bmiRounded);

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
            [bmiRadioNormal, bmiRadioOverweight, bmiRadioObese].forEach(radio => { radio.checked = (radio === autoSelectRadio); });
            form.dispatchEvent(new Event('change'));

        } catch (error) {
            console.error("Error in calculateAndDisplayBMI:", error);
            bmiCategorySpan.textContent = 'Fout bij berekenen';
            bmiCategorySpan.classList.add('bmi-cat-error');
            bmiResultDisplay.classList.add('bmi-result-error');
        }
    }

    function calculateTotalRiskScore() {
        let score = 0;
        console.log("--- Calculating Risk Score ---");
        const standardRadios = form.querySelectorAll(
            'input[name="leeftijd"]:checked, ' +
            'input[name="gewicht"]:checked, ' +
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
                console.log(`+${value} points from ${radio.name}`);
            } else { console.warn(`NaN value found for ${radio.name}`); }
        });

        const waistRadioGeneral = form.querySelector('input[name="buikomtrek"]:checked');
        const waistRadioVrouw = form.querySelector('input[name="buikomtrek_vrouw"]:checked');
        const waistRadioMan = form.querySelector('input[name="buikomtrek_man"]:checked');
        let waistValue = 0;
        if (waistRadioVrouw) {
            waistValue = parseInt(waistRadioVrouw.dataset.genderPoints, 10);
            console.log(`Buikomtrek Vrouw selected: data-gender-points=${waistRadioVrouw.dataset.genderPoints}`);
        } else if (waistRadioMan) {
            waistValue = parseInt(waistRadioMan.dataset.genderPoints, 10);
             console.log(`Buikomtrek Man selected: data-gender-points=${waistRadioMan.dataset.genderPoints}`);
        } else if (waistRadioGeneral) {
            waistValue = parseInt(waistRadioGeneral.value, 10);
             console.log(`Buikomtrek Algemeen selected: value=${waistRadioGeneral.value}`);
        } else { console.warn("No Buikomtrek option selected?"); }
        if (!isNaN(waistValue)) {
            score += waistValue;
            console.log(`+${waistValue} points from Buikomtrek`);
        } else { console.warn(`NaN value found for Buikomtrek`); }

        console.log(`=== Total Calculated Score: ${score} ===`);
        return score;
    }

    function displayResults(score) {
        // === DEZE REGEL IS AANGEPAST ===
        finalScoreDisplay.textContent = `${score} ${score === 1 ? 'punt' : 'punten'}`;
        // ================================
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
    form.addEventListener('change', checkAllQuestionsAnswered);
    if (calculateBmiButton) {
         calculateBmiButton.addEventListener('click', calculateAndDisplayBMI);
         console.log("BMI button event listener attached");
    } else { console.error("BMI Calculate Button not found!"); }
    [heightInput, weightInput].forEach(input => {
        if(input) {
            input.addEventListener('keypress', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    calculateAndDisplayBMI();
                }
            });
        } else { console.error("Height or Weight input not found!"); }
    });
    calculateButton.addEventListener('click', () => {
        console.log("Main Calculate button clicked");
        calculatedScore = calculateTotalRiskScore();
        displayResults(calculatedScore);
        showPage('page2');
    });
    backButton.addEventListener('click', () => {
        showPage('page1');
    });

    // === Initialisatie ===
    checkAllQuestionsAnswered();

});