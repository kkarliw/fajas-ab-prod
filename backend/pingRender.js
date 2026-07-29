const url = "https://fajas-ab-prod.onrender.com/api/v1/health-clean-db";

function ping() {
  fetch(url)
    .then(r => r.json())
    .then(data => {
      console.log(data);
      if (data.status === "cleaned and 3 fake testimonials created") {
        console.log("SUCCESS!");
        process.exit(0);
      } else {
        setTimeout(ping, 5000);
      }
    })
    .catch(err => {
      console.log("Error pinging, retrying...", err.message);
      setTimeout(ping, 5000);
    });
}

console.log("Waiting for Render to deploy...");
ping();
