 document.getElementById("delete-medicine").addEventListener("click", function(event) {
 
  console.log("calling the onlick");
   event.preventDefault();
    axios.delete("http://localhost:3001/medicine/delete/"+event.target.getAttribute('dataid'))
    .then(response =>{
      console.log(response);
      alert("deleting post");
      window.location = '/';
    })
    .catch(error => console.log(error))
  });