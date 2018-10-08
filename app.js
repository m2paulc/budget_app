//this module is the data controller
// Budget Controller
const budgetController = (function() {
  //function Constructor for Expense
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };
  
  Expense.prototype.calcPercentage = function(totalIncome) {
    //validate income first then calc percentage
    (totalIncome > 0) ? this.percentage = Math.round((this.value / totalIncome) * 100) : this.percentage = -1;
  };
  
  Expense.prototype.getPercentage = function() { 
    return this.percentage; 
  };
  
  //function Constructor for Income
  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };
  
  //private function
  const calculateTotal = function(type) {
    let sum = 0;
    data.allItems[type].forEach((item) => {
      sum += item.value;
    });
    data.totals[type] = sum;
  };
  
  var data = {
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
  };
  
  return {
    addItem: function(type, desc, val) {
      var newItem;
      var id;
      
      //create new ID
      // console.log(data.allItems[type]);
      if(data.allItems[type].length > 0) {
        let lastItem = data.allItems[type].length - 1;
        id=data.allItems[type][lastItem].id + 1;  
      } else {
        id=0;
      }
      
      //create newItem based on type
      if(type === 'exp') {
        newItem = new Expense(id, desc, val);
      } else if(type === 'inc') { 
        newItem = new Income(id, desc, val);
      }
      //put into data structure
      data.allItems[type].push(newItem);
      //return new item
      return newItem;
    },
    
    deleteItem: function(type, id) {
      //map returns a new array
      let idArr = data.allItems[type].map((current) => {
        return current.id;
      });
      
      let index = idArr.indexOf(id);
      
      if(index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },
    
    calculateBudget: function(type) {
      //calc total income and expenses
      if(type === 'exp') {
        calculateTotal('exp')  
      } else if(type === 'inc') {
        calculateTotal('inc')
      }
      
      //calc budget = income - expense
      data.budget = data.totals.inc - data.totals.exp;
      
      //calc the percentage of income that we have spent
      (data.totals.inc > 0) ? data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100) : data.percentage = -1;
    },
    
    calculatePercentages: function() {
      data.allItems.exp.forEach((current) => {
        current.calcPercentage(data.totals.inc);
      });
    },
    
    getPercentages: function() {
      let allPercentages = data.allItems.exp.map((current) => {
        return current.getPercentage();
      });
      return allPercentages;
    },
    
    getBudget: function() {
      return {
        budget: data.budget,
        totalIncome: data.totals.inc,
        totalExpenses: data.totals.exp,
        percentage: data.percentage
      }
    },
    
    testing: function() {
      console.log(data);
    }
  };
})();

//this module is for handling UI
const UIController = (() => {
  //create variables for each class for maintenable coding
  let DOMstrings = {
    inputType: '.add__type',
    inputDesc: '.add__description',
    inputVal: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercentageLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };
  
  const formatNumber = function(num, type) {
      num = Math.abs(num);
      num = num.toFixed(2);
      let numSplit = num.split('.');
      let int = numSplit[0];
      //set commas for thousands
      if(int.length > 3) {
        int = int.substr(0, (int.length - 3)) + ',' + int.substr((int.length - 3), 3);
      }
      let dec = numSplit[1];
      
      return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec; 
    };
    
    //create forEach for node arrays
    //nodeListForEach()
    const nodeListForEach = function(list, callback) {
      for(var i = 0; i < list.length; i++) {
        callback(list[i], i);
      }
    };
  
  //public method
  return {
    getInput: function() {
      //return as object so can be passed along other functions
      return {
        //inc = income exp = expense
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDesc).value,
        value: parseFloat(document.querySelector(DOMstrings.inputVal).value)
      };
    },
    
    addListItem: function(obj, type) {
      var html, 
          newHTML, 
          element;
      //create html string with placeholder text
      if(type === 'inc') {
        element = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%">' +
          '<div class="item__description">%description%</div>' +
          '<div class="right clearfix">' +
            '<div class="item__value"> %value%</div>' +
            '<div class="item__delete">' +
              '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
            '</div>' +
          '</div>' +
        '</div>';
      } else if(type === 'exp') {
        element = DOMstrings.expensesContainer;
        html = '<div class="item clearfix" id="exp-%id%">' +
            '<div class="item__description">%description%</div>' +
            '<div class="right clearfix">' +
                '<div class="item__value"> %value%</div>' +
                '<div class="item__percentage">21%</div>' +
                '<div class="item__delete">' +
                    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                '</div>' +
            '</div>' +
        '</div>';
      }
      //replace placeholder text with actual data
      newHTML = html.replace('%id%', obj.id);
      newHTML = newHTML.replace('%description%', obj.description);
      newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));
      
      //insert the html into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
    },
    
    removeListItem: function(selectedID) {
      //js can only remove child element
      let el = document.getElementById(selectedID);
      // console.log(el);
      el.parentNode.removeChild(el);
    },
    
    //clear input fields after user entered an item
    clearFields: function() {
      var fields;
      //creates a list like an array
      fields = document.querySelectorAll(DOMstrings.inputDesc + ', ' + DOMstrings.inputVal);
      //use slice method to the list to turn into an array
      const fieldsArr = Array.prototype.slice.call(fields);
      //loop thru the array
      fieldsArr.forEach((current, index, array) => {
        current.value = '';
      });
      fieldsArr[0].focus();
    },
    
    displayBudget: function(obj) {
      let type;
      (obj.budget > 0) ? type = 'inc' : type = 'exp';
      
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExpenses, 'exp');
      if(obj.percentage >= 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      } else { 
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
    },
    
    displayPercentages: function(percentages) {
      let fieldPercentages = document.querySelectorAll(DOMstrings.expensesPercentageLabel);
    
      nodeListForEach(fieldPercentages, function(item, index) {
        (percentages[index] > 0) ? item.textContent = percentages[index] + '%' : item.textContent = '---';
      });
      
    },
    
    displayMonth: function() {
      var now = new Date();
      let year = now.getFullYear();
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      let month = now.getMonth();
      
      document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
    },
    
    changedType: function() {
      let fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDesc + ',' + DOMstrings.inputVal);
      
      nodeListForEach(fields, function(cur) {
        cur.classList.toggle('red-focus');
      });
      
      //change button for expense
      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
    },
    
    //make DOMstrings Object available for other functions
    getDOMStrings: function() {
      return DOMstrings;
    }
  };
  
})();

//this module is the controller to bridge UI and Data
// Global Controller
const controller = ((budgetCtrl, UICtrl) => {
  
  const setupEventListeners = () => {
    const DOMstr = UICtrl.getDOMStrings();
    document.querySelector(DOMstr.inputBtn).addEventListener('click', ctrAddItem);
  
    document.addEventListener('keypress', (event) => {
      // console.log(event);
      if(event.keyCode === 13 || event.which === 13) {
        ctrAddItem();
      }
    });
    
    document.querySelector(DOMstr.container).addEventListener('click', ctrDeleteItem);
    
    //this will help user to determine if they're input is income or expense
    document.querySelector(DOMstr.inputType).addEventListener('change', UICtrl.changedType);
  };
  
  //create method to update Budget
  const updateBudget = function() {
    let input = UICtrl.getInput()
    //calculate the budget
    budgetCtrl.calculateBudget(input.type);
    
    //method to return the budget
    let budget = budgetCtrl.getBudget();
    
    //display budget
    UICtrl.displayBudget(budget);
  };
  
  const updatePercentages = function() {
    //calc entered expense percentages
    budgetCtrl.calculatePercentages();
    
    //read percentages from budget controller
    var percentages = budgetCtrl.getPercentages();
    
    //update UI with new percentage
    UICtrl.displayPercentages(percentages);
    
  };
  
  //method to add new item
  const ctrAddItem = function() {
    //get input field
    let input = UICtrl.getInput();
    // console.log(input);
    
    //check input fields first for valid values
    if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
      //add item to budget controller
      var newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      // console.log(newItem);
      
      //add item to UI
      UICtrl.addListItem(newItem, input.type);
      
      //clear fields
      UICtrl.clearFields();
      
      //calc and update budget
      updateBudget(); 
      
      //calc and update percentages
      updatePercentages();
    }
    
  };
  
  const ctrDeleteItem = function(event) {
    let itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    
    if(itemID) {
      let splitID = itemID.split('-');
      let type = splitID[0];
      let ID = parseInt(splitID[1]);
      
      //delete the whole div from the data structure
      budgetCtrl.deleteItem(type, ID);
      
      //delete the item from UI
      UICtrl.removeListItem(itemID);
      
      //update and show new budget
      updateBudget();
      
    }
  }
  
  //make init global
  return {
    init: function() {
      console.log('Application has Started');
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalIncome: 0,
        totalExpenses: 0,
        percentage: -1
      })
      setupEventListeners();
    }
  };
})(budgetController, UIController);

controller.init();