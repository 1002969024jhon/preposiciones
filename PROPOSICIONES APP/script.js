document.addEventListener("DOMContentLoaded", () => {
  const expressionDiv = document.getElementById("expression")
  const errorDiv = document.getElementById("error")
  const truthTableDiv = document.getElementById("truth-table")

  const validCharacters = ["p", "q", "r", "∧", "∨", "⊻", "→", "↔", "¬", "(", ")"]

  document.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.id === "evaluate") {
        evaluateExpression()
      } else if (button.id === "clear") {
        clearExpression()
      } else {
        insertAtEnd(button.dataset.value)
      }
    })
  })

  expressionDiv.addEventListener("input", () => {
    errorDiv.textContent = ""
    validateCharacters()
  })

  expressionDiv.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      evaluateExpression()
    }
  })

  function insertAtEnd(text) {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);

    // Verificar si el cursor está en el área de expresión
    if (!expressionDiv.contains(selection.focusNode)) {
        return; // Si no está en el área de expresión, no hacemos nada
    }

    // Eliminar el contenido seleccionado (si lo hay)
    range.deleteContents();

    // Insertar el nuevo texto en la posición del cursor
    range.insertNode(document.createTextNode(text));

    // Mover el cursor después del texto insertado
    range.collapse(false);

    // Restaurar el enfoque en el div de la expresión
    selection.removeAllRanges();
    selection.addRange(range);
    expressionDiv.focus();

    // Validar la expresión después de la modificación
    validateExpression();
}


  function validateCharacters() {
    const expression = expressionDiv.textContent
    const invalidChars = [...expression].filter((char) => !validCharacters.includes(char))
    if (invalidChars.length > 0) {
      showError("Expresión incorrecta, hay caracteres inadecuados.")
      truthTableDiv.innerHTML = "" // Borra el resultado anterior
      return false // Detiene la ejecución
    }
    return true
  }

  function validateExpression() {
    const expression = expressionDiv.textContent.trim()
    const operators = ["∧", "∨", "⊻", "→", "↔", "¬"]
    const propositions = ["p", "q", "r"]

    for (let i = 0; i < expression.length - 1; i++) {
      if (propositions.includes(expression[i]) && propositions.includes(expression[i + 1])) {
        showError("No se pueden colocar dos proposiciones seguidas")
        return false
      }
    }

    for (let i = 0; i < expression.length - 1; i++) {
      if (operators.includes(expression[i]) && operators.includes(expression[i + 1])) {
        if (expression[i] !== "¬" && expression[i + 1] !== "¬") {
          showError("No se pueden colocar dos conectores seguidos, excepto la negación")
          return false
        }
      }
    }

    return true
  }

  function evaluateExpression() {
    const expression = expressionDiv.textContent.trim();
  
    if (!validateCharacters()) {
      return; // Detiene la ejecución si hay caracteres inválidos
    }
  
    if (expression.length === 0) {
      showError("La expresión está vacía");
      return;
    }
  
    if (!validateExpression()) {
      return;
    }
  
    const operators = ["∧", "∨", "⊻", "→", "↔", "¬"];
    if (operators.some((op) => expression.endsWith(op))) {
      showError("La expresión no puede terminar con un operador");
      return;
    }
  
    // Verificar expresiones como p(q) sin operador
    if (/\w\(/.test(expression)) {
      showError("Error en la expresión, inténtalo de nuevo");
      return;
    }
  
    // Siempre usar el orden p, q, r si están en la expresión
    const allProps = ["p", "q", "r"];
    const propositions = allProps.filter((prop) => expression.includes(prop));
    const numPropositions = propositions.length;
  
    let table = "<table><thead><tr>";
    propositions.forEach((prop) => {
      table += `<th>${prop}</th>`;
    });
    table += "<th>Resultado</th></tr></thead><tbody>";
  
    const numRows = Math.pow(2, numPropositions);
  
    for (let i = 0; i < numRows; i++) {
      let row = "<tr>";
      let expr = expression;
  
      propositions.forEach((prop, index) => {
        let value;
        
        // Generar valores en el orden correcto
        if (index === 0) {
          // p: 4V, 4F
          value = i < numRows / 2;
        } else if (index === 1) {
          // q: 2V, 2F, 2V, 2F
          value = Math.floor(i / (numRows / 4)) % 2 === 0;
        } else {
          // r: Alternados (V, F, V, F, ...)
          value = i % 2 === 0;
        }
  
        row += `<td>${value ? "V" : "F"}</td>`;
        expr = expr.replace(new RegExp(prop, "g"), value ? "1" : "0");
      });
  
      try {
        const result = evaluateBooleanExpression(expr);
        row += `<td>${result ? "V" : "F"}</td>`;
      } catch (error) {
        showError("Error en la expresión, inténtalo de nuevo");
        return;
      }
  
      row += "</tr>";
      table += row;
    }
  
    table += "</tbody></table>";
    truthTableDiv.innerHTML = table;
  }
  function evaluateBooleanExpression(expr) {
    expr = expr
      .replace(/¬/g, "!")
      .replace(/∧/g, "&&")
      .replace(/∨/g, "||")
      .replace(/⊻/g, "!=")
      .replace(/→/g, "<=")
      .replace(/↔/g, "==")
    return eval(expr)
  }
  

  function clearExpression() {
    expressionDiv.textContent = ""
    errorDiv.textContent = ""
    truthTableDiv.innerHTML = ""
    expressionDiv.focus()
  }

  function showError(message) {
    errorDiv.textContent = message
  }
})
