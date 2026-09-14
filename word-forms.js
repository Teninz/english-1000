// Явные формы из примеров: неправильные глаголы, удвоения и окончания словосочетаний.
const EXAMPLE_FORMS = {
  "résumé":"résumé", withdraw:"withdrew", freeze:"froze", ban:"banned",
  "side effect":"side effects", "mortgage rate":"Mortgage rates", occur:"occurred",
  overcome:"overcame", undergo:"underwent", fulfil:"fulfilled", "bring up":"brought up",
  "break down":"broke down", "come across":"came across", "come up with":"came up with",
  "make up":"made up", "run out of":"ran out of", "take off":"took off", "take over":"took over",
  "take up":"took up", "go through":"went through", "let down":"let me down",
  "drop out":"dropped out", "run into":"ran into", "wear out":"wore out"
};
// Дополнительный контекст: показывается в проверке после первого знакомства с карточкой.
const WORD_CONTEXT = {
  assume:{phrase:"assume that…",example:"Do not assume that everyone agrees with you.",ru:"Не предполагай, что все с тобой согласны."},
  consider:{phrase:"consider doing something",example:"We are considering moving to a smaller town.",ru:"Мы подумываем о переезде в город поменьше."},
  doubt:{phrase:"have doubts about",example:"I doubt that this key opens the door.",ru:"Сомневаюсь, что этот ключ открывает дверь."},
  estimate:{phrase:"estimate the cost",example:"Can you estimate how long the journey will take?",ru:"Можешь оценить, сколько времени займёт поездка?"},
  imply:{phrase:"imply that…",example:"Her smile seemed to imply that she knew the answer.",ru:"Её улыбка, казалось, намекала, что она знает ответ."},
  insist:{phrase:"insist on doing something",example:"They insist on checking every ticket.",ru:"Они настаивают на проверке каждого билета."},
  rely:{phrase:"rely on someone",example:"Children rely on adults to keep them safe.",ru:"Дети полагаются на взрослых в вопросах своей безопасности."},
  apply:{phrase:"apply for a job",example:"You can apply for the job online.",ru:"Подать заявку на эту работу можно через интернет."},
  hesitate:{phrase:"hesitate to ask",example:"Please do not hesitate to ask for help.",ru:"Пожалуйста, не стесняйся просить о помощи."},
  convince:{phrase:"convince someone to do something",example:"Can you convince him to join our team?",ru:"Можешь убедить его присоединиться к нашей команде?"},
  avoid:{phrase:"avoid doing something",example:"Try to avoid using your phone during dinner.",ru:"Старайся не пользоваться телефоном во время ужина."},
  refuse:{phrase:"refuse to do something",example:"I refuse to believe that the story is true.",ru:"Я отказываюсь верить, что эта история правдива."}
};
