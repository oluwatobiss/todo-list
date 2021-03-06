import {
  DOM,
  projsAndTasks,
  createTask,
  createImportantTasks,
  isToday,
  isTomorrow,
  isThisWeek,
  startOfWeek,
  addDays,
  isSameWeek,
  parseISO,
} from "./aggregator";

// eslint-disable-next-line import/no-mutable-exports
export let clickedTaskIndex = null;
export default (objClicked) => {
  const addNewTaskBtn = objClicked.target.closest("#add-new-task-btn");
  const taskDoneChkBox = objClicked.target.closest(".task-done-chkbox");
  const taskAndDueDateDiv = objClicked.target.closest(".task-and-due-date");
  const starIcon = objClicked.target.closest(".fa-star");
  const editTaskBtn = objClicked.target.closest(".edit-task-btn");
  const trashTaskBtn = objClicked.target.closest(".trash-task-btn");

  if (addNewTaskBtn) {
    const projOptsArr = [...DOM.projDropDown.children];
    DOM.taskModalHeader.innerText = "New Task";
    DOM.addTaskBtn.innerText = "Add Task";
    // Pre-choose the project to which the new task should be added
    if (projOptsArr.some((i) => i.value === DOM.activePgTitle.innerText)) {
      const activePgProjOptIndex = projOptsArr.findIndex(
        (i) => i.value === DOM.activePgTitle.innerText
      );
      DOM.projDropDown.children[activePgProjOptIndex].selected = true;
    } else {
      DOM.projDropDown.children[0].selected = true;
    }
    showNewTaskModal();
  }

  if (taskDoneChkBox) {
    getClickedTaskIndex(taskDoneChkBox);
    const clickedTaskCard = DOM.taskCards[clickedTaskIndex];
    const clickedTaskProjName = clickedTaskCard
      .querySelector(".task-proj")
      .getAttribute("taskproj");
    const clickedCardTask = clickedTaskCard.querySelector(".task");
    const clickedTaskTitle = clickedCardTask.innerText;
    // Toggle the task-done's class state and the taskDone property state
    clickedCardTask.classList.toggle("task-done");
    if (taskDoneChkBox.checked) {
      projsAndTasks[clickedTaskProjName].forEach(changeTaskDoneToTrue);
      function changeTaskDoneToTrue(currItem, currItemInd) {
        if (
          currItem.taskProj === clickedTaskProjName &&
          currItem.task === clickedTaskTitle
        ) {
          projsAndTasks[clickedTaskProjName][currItemInd].taskDone = true;
        }
      }
    } else {
      projsAndTasks[clickedTaskProjName].forEach(changeTaskDoneToFalse);
      function changeTaskDoneToFalse(currItem, currItemInd) {
        if (
          currItem.taskProj === clickedTaskProjName &&
          currItem.task === clickedTaskTitle
        ) {
          projsAndTasks[clickedTaskProjName][currItemInd].taskDone = false;
        }
      }
    }
    localStorage.setItem("myPlans", JSON.stringify(projsAndTasks));
  }

  if (taskAndDueDateDiv) {
    getClickedTaskIndex(taskAndDueDateDiv);
    const clickedCardNote = DOM.taskCards[clickedTaskIndex].querySelector(
      ".task-note"
    );
    clickedCardNote.style.display === ""
      ? (clickedCardNote.style.display = "grid")
      : (clickedCardNote.style.display = "");
  }

  if (starIcon) {
    getClickedTaskIndex(starIcon.closest("button"));
    const clickedTaskCard = DOM.taskCards[clickedTaskIndex];
    const clickedTaskProjName = clickedTaskCard
      .querySelector(".task-proj")
      .getAttribute("taskproj");
    const clickedTaskTitle = clickedTaskCard.querySelector(".task").innerText;

    starIcon.classList.toggle("important-task");
    if (DOM.activePgTitle.innerText === "Important") {
      projsAndTasks[clickedTaskProjName].forEach(changeImpToFalse);
      projsAndTasks.Important -= 1;
      document.querySelector(".important-task-amt").innerText =
        projsAndTasks.Important;

      while (DOM.activePgBody.firstChild) {
        DOM.activePgBody.firstChild.remove();
      }
      createImportantTasks();

      function changeImpToFalse(currItem, currItemInd) {
        if (
          currItem.taskProj === clickedTaskProjName &&
          currItem.task === clickedTaskTitle
        ) {
          projsAndTasks[clickedTaskProjName][currItemInd].important = false;
          clickedTaskCard
            .querySelector(".important-btn")
            .setAttribute("important", false);
        }
      }
    }

    if (DOM.activePgTitle.innerText !== "Important") {
      if (
        DOM.activePgTitle.innerText === "Today" ||
        DOM.activePgTitle.innerText === "Tomorrow" ||
        DOM.activePgTitle.innerText === "This Week" ||
        DOM.activePgTitle.innerText === "Next Week" ||
        DOM.activePgTitle.innerText === "All Tasks"
      ) {
        projsAndTasks[clickedTaskProjName].forEach(changeTaskImportance);
        function changeTaskImportance(currItem) {
          if (
            currItem.taskProj === clickedTaskProjName &&
            currItem.task === clickedTaskTitle
          ) {
            if (currItem.important) {
              currItem.important = false;
              clickedTaskCard
                .querySelector(".important-btn")
                .setAttribute("important", false);
              projsAndTasks.Important -= 1;
              document.querySelector(".important-task-amt").innerText =
                projsAndTasks.Important;
            } else {
              currItem.important = true;
              clickedTaskCard
                .querySelector(".important-btn")
                .setAttribute("important", true);
              projsAndTasks.Important += 1;
              document.querySelector(".important-task-amt").innerText =
                projsAndTasks.Important;
            }
          }
        }
      } else if (
        projsAndTasks[clickedTaskProjName][clickedTaskIndex].important
      ) {
        projsAndTasks[clickedTaskProjName][clickedTaskIndex].important = false;
        clickedTaskCard
          .querySelector(".important-btn")
          .setAttribute("important", false);
        projsAndTasks.Important -= 1;
        document.querySelector(".important-task-amt").innerText =
          projsAndTasks.Important;
      } else {
        projsAndTasks[clickedTaskProjName][clickedTaskIndex].important = true;
        clickedTaskCard
          .querySelector(".important-btn")
          .setAttribute("important", true);
        projsAndTasks.Important += 1;
        document.querySelector(".important-task-amt").innerText =
          projsAndTasks.Important;
      }
    }
    localStorage.setItem("myPlans", JSON.stringify(projsAndTasks));
  }

  if (editTaskBtn) {
    getClickedTaskIndex(editTaskBtn.closest("button"));
    const projOptsArr = [...DOM.projDropDown.children];
    const clickedTaskCard = DOM.taskCards[clickedTaskIndex];
    const clickedTaskTitle = clickedTaskCard.querySelector(".task").innerText;
    const clickedTaskProjName = clickedTaskCard
      .querySelector(".task-proj")
      .getAttribute("taskproj");

    DOM.taskModalHeader.innerText = "Edit Task";
    DOM.addTaskBtn.innerText = "Update Task";

    if (
      DOM.activePgTitle.innerText === "Important" ||
      DOM.activePgTitle.innerText === "Today" ||
      DOM.activePgTitle.innerText === "Tomorrow" ||
      DOM.activePgTitle.innerText === "This Week" ||
      DOM.activePgTitle.innerText === "Next Week" ||
      DOM.activePgTitle.innerText === "All Tasks"
    ) {
      projsAndTasks[clickedTaskProjName].forEach(preFillModalBox);
      function preFillModalBox(currItem) {
        if (
          currItem.taskProj === clickedTaskProjName &&
          currItem.task === clickedTaskTitle
        ) {
          DOM.modalBoxTaskTitle.value = currItem.task;
          DOM.modalBoxTaskNote.value = currItem.note;
          DOM.modalBoxTaskDate.value = currItem.dueDate;
          DOM.modalBoxTaskImportance.checked = currItem.important;
        }
      }
    } else {
      // Prefill Modal Box
      const clickedTaskObj =
        projsAndTasks[DOM.activePgTitle.innerText][clickedTaskIndex];
      DOM.modalBoxTaskTitle.value = clickedTaskObj.task;
      DOM.modalBoxTaskNote.value = clickedTaskObj.note;
      DOM.modalBoxTaskDate.value = clickedTaskObj.dueDate;
      DOM.modalBoxTaskImportance.checked = clickedTaskObj.important;
    }
    // Pre-choose the project to which the updated task should be added
    if (projOptsArr.some((i) => i.value === clickedTaskProjName)) {
      const activePgProjOptIndex = projOptsArr.findIndex(
        (i) => i.value === clickedTaskProjName
      );
      DOM.projDropDown.children[activePgProjOptIndex].selected = true;
    }
    showNewTaskModal();
  }

  if (trashTaskBtn) {
    getClickedTaskIndex(trashTaskBtn.closest("button"));
    const clickedTaskCard = DOM.taskCards[clickedTaskIndex];
    const clickedTaskTitle = clickedTaskCard.querySelector(".task").innerText;
    const clickedTaskProjName = clickedTaskCard
      .querySelector(".task-proj")
      .getAttribute("taskproj");
    const clickedTaskProjNameConvert = clickedTaskProjName
      .toLowerCase()
      .replace(/\W/g, "-");

    if (DOM.activePgTitle.innerText !== "Important") {
      if (
        DOM.activePgTitle.innerText === "Today" ||
        DOM.activePgTitle.innerText === "Tomorrow" ||
        DOM.activePgTitle.innerText === "This Week" ||
        DOM.activePgTitle.innerText === "Next Week" ||
        DOM.activePgTitle.innerText === "All Tasks"
      ) {
        // Find the clicked task in the projsAndTasks object and delete it
        for (let i = 0; i < projsAndTasks[clickedTaskProjName].length; i++) {
          const currItem = projsAndTasks[clickedTaskProjName][i];
          if (
            currItem.taskProj === clickedTaskProjName &&
            currItem.task === clickedTaskTitle
          ) {
            projsAndTasks[clickedTaskProjName].splice(i, 1);
            if (currItem.important) {
              delTaskFromImpProj();
            }
          }
        }
      } else {
        // If the clicked task is important, delete it from the important projects
        if (projsAndTasks[clickedTaskProjName][clickedTaskIndex].important) {
          delTaskFromImpProj();
        }
        // Delete the clicked task from the projsAndTasks object
        projsAndTasks[clickedTaskProjName].splice(clickedTaskIndex, 1);
      }
    }

    if (DOM.activePgTitle.innerText === "Important") {
      // Delete task from the important projects
      delTaskFromImpProj();
      // Find the clicked task in the projsAndTasks object and delete it
      for (let i = 0; i < projsAndTasks[clickedTaskProjName].length; i++) {
        const currItem = projsAndTasks[clickedTaskProjName][i];
        if (
          currItem.taskProj === clickedTaskProjName &&
          currItem.task === clickedTaskTitle
        ) {
          projsAndTasks[clickedTaskProjName].splice(i, 1);
        }
      }
    }

    // Update the localStorage
    localStorage.setItem("myPlans", JSON.stringify(projsAndTasks));
    // Update the displayed number of tasks in the deleted task's project
    document.querySelector(
      `.${clickedTaskProjNameConvert}-task-amt`
    ).innerText = projsAndTasks[clickedTaskProjName].length;
    // Update the content displayed onscreen
    while (DOM.activePgBody.firstChild) {
      DOM.activePgBody.firstChild.remove();
    }
    if (DOM.activePgTitle.innerText === "Important") {
      createImportantTasks();
    } else if (
      DOM.activePgTitle.innerText === "Today" ||
      DOM.activePgTitle.innerText === "Tomorrow" ||
      DOM.activePgTitle.innerText === "This Week" ||
      DOM.activePgTitle.innerText === "Next Week" ||
      DOM.activePgTitle.innerText === "All Tasks"
    ) {
      const todaysDate = new Date();
      const startOfTodaysWeek = startOfWeek(todaysDate);
      const startOfNextWeek = addDays(startOfTodaysWeek, 7);

      const keysInProjsAndTasks = Object.keys(projsAndTasks);
      keysInProjsAndTasks.forEach((i) => {
        if (i !== "Important") {
          projsAndTasks[i].forEach(createTaskBasedOnNavClicked);
          function createTaskBasedOnNavClicked(currItem) {
            if (
              (DOM.activePgTitle.innerText === "Today" &&
                isToday(parseISO(currItem.dueDate))) ||
              (DOM.activePgTitle.innerText === "Tomorrow" &&
                isTomorrow(parseISO(currItem.dueDate))) ||
              (DOM.activePgTitle.innerText === "This Week" &&
                isThisWeek(parseISO(currItem.dueDate))) ||
              (DOM.activePgTitle.innerText === "Next Week" &&
                isSameWeek(parseISO(currItem.dueDate), startOfNextWeek)) ||
              DOM.activePgTitle.innerText === "All Tasks"
            ) {
              createTask(currItem);
            }
          }
        }
      });
    } else {
      projsAndTasks[clickedTaskProjName].forEach((i) => createTask(i));
    }

    function delTaskFromImpProj() {
      projsAndTasks.Important -= 1;
      document.querySelector(".important-task-amt").innerText =
        projsAndTasks.Important;
    }
  }

  function showNewTaskModal() {
    DOM.newTaskModalBg.style.display = "block";
  }

  function getClickedTaskIndex(clickedEle) {
    for (let i = 0; i < DOM.taskCards.length; i++) {
      const task = DOM.taskCards[i].querySelector(".task").innerText;
      const taskConvert = task.toLowerCase().replace(/\W/g, "-");
      if (clickedEle.parentNode.getAttribute("task") === taskConvert) {
        clickedTaskIndex = i;
      }
    }
  }
};
