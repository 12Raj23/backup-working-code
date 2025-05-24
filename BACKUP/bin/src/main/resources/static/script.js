document.addEventListener("DOMContentLoaded", function () {
  const serverForm = document.getElementById("serverForm");
  const ipPage = document.getElementById("page0");
  const pageHeader = document.getElementById("pageHeader");

  // Server form handler
  serverForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const ipAddress = document.getElementById("ipAddress").value.trim();
    const port = document.getElementById("port").value.trim();

    fetch("http://localhost:8080/connect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ipAddress, port }),
    })
      .then(async (res) => {
        const responseText = await res.text();
        if (res.ok) {
          alert("Connection established: " + responseText);
          ipPage.classList.remove("active");
          document.getElementById("page1").classList.add("active");
          pageHeader.textContent = "Camera Control Panel";
          document.getElementById("startOutput").textContent = ""; // Clear error message
        } else {
          alert("Connection failed: " + responseText);
          document.getElementById("startOutput").textContent = "Connection failed: " + responseText;
        }
      })
      .catch((err) => {
        console.error(err);
        alert("Error occurred: Could not connect to server");
        document.getElementById("startOutput").textContent = "Error: Could not connect to server";
      });
  });

  // Handle all control button clicks, with long press on zoom_in and zoom_out only
  let holdTimeout;
  let isHolding = false;

  const controlButtons = document.querySelectorAll(".control-button");
  controlButtons.forEach((button) => {
    const baseCommand = button.getAttribute("data-value");

    if (baseCommand === "zoom_in" || baseCommand === "zoom_out") {
      // Long press logic for zoom_in and zoom_out
      button.addEventListener("mousedown", () => {
        isHolding = false;
        holdTimeout = setTimeout(() => {
          isHolding = true;
          sendCommand(baseCommand + "_long");
        }, 500); // 500 ms for long press
      });

      button.addEventListener("mouseup", () => {
        clearTimeout(holdTimeout);
        if (!isHolding) {
          sendCommand(baseCommand);
        }
      });

      button.addEventListener("mouseleave", () => {
        clearTimeout(holdTimeout);
      });
    } else {
      // Normal click for others
      button.addEventListener("click", () => {
        sendCommand(baseCommand);
      });
    }
  });

  // Navigation buttons
  document.getElementById("nextPage").addEventListener("click", function () {
    document.getElementById("page1").classList.remove("active");
    document.getElementById("page2").classList.add("active");
    document.getElementById("output").textContent = "Camera Controls";
  });

  document.getElementById("prevPage").addEventListener("click", function () {
    document.getElementById("page2").classList.remove("active");
    document.getElementById("page1").classList.add("active");
    document.getElementById("output").textContent = "Camera Controls";
  });

  function sendCommand(command) {
    console.log("Sending command:", command);
    fetch("http://localhost:8080/button1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ value: command }),
    })
      .then(async (res) => {
        const data = await res.text();
        if (res.ok) {
          alert("Command sent successfully:");
        } else {
          alert("Failed to send command:");
        }
      })
      .catch((err) => {
        alert("Error sending command:");
      });
  }
}); 