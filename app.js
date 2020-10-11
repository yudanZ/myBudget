// BUDGET CONTROLLER
var budgetController = (function(){
    class Expense {
        constructor( id, description, value){
            this.id = id;
            this.description = description;
            this.value = value;
            this.percentage = -1;
        }

        calculatePercentage( totalIncome){
            //console.log(totalIncome);
            if( totalIncome > 0){
                this.percentage = Math.round((this.value / totalIncome) * 100);
            }else {
                this.percentage = -1;
            }
            
        }

        getPercentage(){
            return this.percentage;
        }
        
    };
    class Income{
        constructor(id, description, value){
            this.id = id;
            this.description = description;
            this.value = value;
        }
    };

    const data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

   
    const getSumValue = ( arr) => {
        return arr.reduce(( accumulator, item) => {return accumulator + item.value}, 0);
    }
    
    return{

        addItemToBudget: function({type, description, value}){
            //console.log(type);
            var newItem, id;
            const subItems = data.allItems[type];
            //console.log(subItems);
            //create new id 
            if(subItems.length > 0){
                id = subItems[subItems.length -1].id + 1;
            }else {
                id = 0;
            }
            
            //console.log(id);
            //create income structure
            if(type === 'inc'){
                newItem = new Income(id, description, value)
            } else if( type === 'exp'){
                newItem = new Expense(id, description, value)
            }
            //console.log(newItem)
            //store data to our data structure
            data.allItems[type].push(newItem);
            //console.log(data); 
            return newItem;         
                
        },
        deleteItemFromBudget: function(type, id) {
            const subItem = data.allItems[type];
            
            data.allItems[type] = subItem.filter( item => {
                //console.log(item)
                return item.id !== parseInt(id)
                }  
            )
            //console.log(data);
        },



        calculateBudget: function(){
            // sum of income
            const incomeArr = data.allItems['inc'];
            //console.log(incomeArr);
            const totalIncome = getSumValue(incomeArr);

            //console.log(totalincome);
            data.totals['inc'] = totalIncome;

            //sum of expense

            const expArr = data.allItems['exp'];
            const totalExpense = getSumValue(expArr);
            data.totals['exp'] = totalExpense;
            
            //budget = income - expenses
            data.budget = totalIncome - totalExpense;
            //percentages of expenses
            if( totalIncome > 0){
                data.percentage = Math.round((totalExpense / totalIncome) * 100);
            }else {
                data.percentage = -1;
            }
            
            //console.log(data);
        },

        calculatePercentages: function(){
            data.allItems['exp'].forEach( item => {
                item.calculatePercentage(data.totals.inc)
            } )
        },

        getPercentages: function(){
            return data.allItems.exp.map( item => {
                return  item.getPercentage();
            })
        },

        getBudget: function(){
            return{
                budget: data.budget,
                percentage: data.percentage,
                totalIncome: data.totals.inc,
                totalExpense: data.totals.exp
            }
        }
    };//return
})();


//UI CONTROLLER
var UIController = (function(){
    //define all DOM STRINGs
    const DOMstrings = {
        inputType: '.add__type',
        description: '.add__description',
        value: '.add__value',
        addButton: '.add__btn',
        expensesList: '.expenses__list',
        incomeList: '.income__list',
        budgetValue: '.budget__value',
        budgetIncomeValue: '.budget__income--value',
        budgetExpensesValue: '.budget__expenses--value',
        budgetExpensesPercentage: '.budget__expenses--percentage',
        budgetTitleMonth: '.budget__title--month',
        container: '.container',
        expensesPercentage: '.item__percentage',
       
    }

    const getCurrentMonth = () => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const d = new Date();
        const n = d.getMonth();
        const year = d.getFullYear();
        return months[n] + ' ' + year;
        

    } 

    const formatNumber = ( num, type) => {
        /**
         * add + or - before number
         * exactly 2 decimal points
         * comma separating the thousands
         */

         num = Math.abs(num);
         num = num.toFixed(2);
         numSplit = num.split('.');
         numSplit[0] = numSplit[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
         const str = numSplit.join('.');
         if(type === 'inc'){
             return '+' + str;
         }else if(type === 'exp'){
             return '-' + str;
         } 
    }

    
    return {
        getInputData:function(){
            const typeValueElement = document.querySelector(DOMstrings.inputType);
            const descriptionElement = document.querySelector(DOMstrings.description);
            const valueElement = document.querySelector(DOMstrings.value);
            return {
                type: typeValueElement.value,
                description: descriptionElement.value,
                value: parseFloat(valueElement.value)
            }        
        },

        addListItem: function( type, newItem ){
            //create HTML string with placeholder text
            //console.log(newItem)
            var str = '';
            var domElement;
            if( type === 'inc'){
                domElement = document.querySelector(DOMstrings.incomeList);
                str = `<div class="item clearfix" id="inc-${newItem.id}">
                            <div class="item__description">${newItem.description}</div>
                            <div class="right clearfix">
                                <div class="item__value"> ${formatNumber(newItem.value, 'inc')}</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`;
            } else if( type === 'exp'){
                domElement = document.querySelector(DOMstrings.expensesList);
                str = `<div class="item clearfix" id="exp-${newItem.id}">
                            <div class="item__description">${newItem.description}</div>
                            <div class="right clearfix">
                                <div class="item__value">${formatNumber(newItem.value, 'exp')}</div>
                                <div class="item__percentage">21%</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`
            }

            domElement.insertAdjacentHTML('beforeend',str);
            
        },
        deleteListItem: function(selectorId){
            const el = document.getElementById(selectorId);
            el.parentNode.removeChild(el)
        },

        changeType: function(){
            const fiels = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.description + ',' + DOMstrings.value);
            fielsArr = Array.from(fiels);
            fielsArr.forEach( item => item.classList.toggle('red-focus'));
            document.querySelector(DOMstrings.addButton).classList.toggle('red');
        },

        displayBudget: function({budget, percentage, totalIncome, totalExpense}){
            const budgetElement = document.querySelector(DOMstrings.budgetValue);
            const incomeElement = document.querySelector(DOMstrings.budgetIncomeValue);
            const expensesElement = document.querySelector(DOMstrings.budgetExpensesValue);
            const percentageElement = document.querySelector(DOMstrings.budgetExpensesPercentage);
            const budgetMonthElement = document.querySelector(DOMstrings.budgetTitleMonth);
            var type;
            budget > 0 ? type = 'inc' : type = 'exp';
            budgetElement.textContent = formatNumber(budget,type);
            incomeElement.textContent = formatNumber(totalIncome, 'inc');
            expensesElement.textContent = formatNumber(totalExpense, 'exp');
            if( percentage > 0){
                percentageElement.textContent = percentage + '%';
            }else {
                percentageElement.textContent = '---';
            }
            
            budgetMonthElement.textContent = getCurrentMonth();
        },

        displayPercentages: function(percentagesArr){
            var fields = document.querySelectorAll(DOMstrings.expensesPercentage);
            var fieldsArr = Array.from(fields);
            fieldsArr.forEach( (element, index) => {
                if( percentagesArr[index] > 0){
                    element.textContent = percentagesArr[index] + '%';
                }else {
                    element.textContent = '---';
                }
                
            })
        },
        

        clearFields: function(){
            const elements = document.querySelectorAll( DOMstrings.description + ',' + DOMstrings.value);
            //console.log(elements)
            const elementsArr = Array.from(elements);
            elementsArr.forEach( element => element.value = "");
            elementsArr[0].focus();
        },

        getDomstrings: function(){
            //)
            return DOMstrings;
        },


    }
})();


//GLOBAL APP CONTROLLER
var controller = (function(budgetCtr, UICtrl){

    const setupEventListeners = () => {

        var DOM = UICtrl.getDomstrings();
        //click button to add either income or expenses
        document.querySelector(DOM.addButton).addEventListener('click', ctrlAddItem);

        //press enter to add either income or expenses
        document.addEventListener('keypress', function(e){
            //console.log(e.keyCode);
            if( e.keyCode === 13 || e.which === 13){
                ctrlAddItem();
            }
        })

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType)
    };

    var updateBudget = function() {
        // 1. Calculate the budget
        budgetCtr.calculateBudget();
        //2. return the budget
        var budget = budgetCtr.getBudget();

        //console.log(budget);
        //3. display the budget on the UI
        UICtrl.displayBudget(budget)
    };

    var updatePercentages = function(){
        // 1 calculate the percentages of each expenses
        budgetCtr.calculatePercentages();

        //get all percentages of each expenses
        const allPercentages = budgetCtr.getPercentages();
        //console.log(allPercentages);

        //display percentages of each expenses
        UICtrl.displayPercentages(allPercentages);
    }
    
    //console.log('dom');
    var ctrlAddItem = function(){
        // 1. get input data
        const inputData = UICtrl.getInputData();
        //console.log(DOMstrings);
        //console.log(inputData);
        if( inputData.description !== "" && !isNaN(inputData.value) && inputData.value > 0){
            // 2. add the item to the budget controller
            const newItem = budgetCtr.addItemToBudget(inputData);
            //3. Add the item to the UI
            UICtrl.addListItem(inputData.type, newItem);

            //4. Clear the fields
            UICtrl.clearFields();

            //4.calculate and update budget
            updateBudget();

            updatePercentages();
           
        }
        
    }
    var ctrlDeleteItem = function(event){
        const itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        //console.log(itemID);
        if( itemID ){  
            const splitId = itemID.split('-');
            //console.log(splitId);
            // delete the item to the budget controller
            budgetCtr.deleteItemFromBudget( splitId[0], splitId[1]);

            //delete item from UI
            UICtrl.deleteListItem(itemID);
            
            //4.calculate and update budget
            updateBudget();

            updatePercentages();

        }
    }

    return {
        init: function(){
            console.log('Application has started');
            UICtrl.displayBudget({
                budget: 0,
                percentage: -1,
                totalIncome: 0,
                totalExpense: 0})
            setupEventListeners();
        }
    }
   
})(budgetController, UIController);

//start applications
controller.init();