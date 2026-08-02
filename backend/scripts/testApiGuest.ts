async function main() {
  const url = "http://localhost:5000/api/v1/orders/guest/ORD-1785694160366-108DA934?email=prueba@fajasab.com";
  console.log("Fetching", url);
  const res = await fetch(url);
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", text);
}

main();
