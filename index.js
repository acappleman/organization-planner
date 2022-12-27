import inquirer from 'inquirer';

const initialQuestion = [
  {
    type: 'list',
    name: 'choice',
    message: 'What would you like to do?',
    choices: [
        'View All Departments',
        'View All Roles',
        'View All Empoyees',
        'Add Department',
        'Add Role',
        'Add Emplyee',
        'Update Employee Role',

    ]
  }
];

function ask() {
  inquirer.prompt(initialQuestion).then((answer) => {
    console.log(answer)
  }).finally(() => {
    ask();
  });
}

ask();