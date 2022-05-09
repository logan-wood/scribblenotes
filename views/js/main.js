




function openNav() {
    document.getElementById("mySidebar").style.width = "250px";
    document.getElementById("openBtn").style.display = "none";
    document.getElementById("closeBtn").style.display = "block";
    
    document.getElementById("main").style.marginLeft = "250px";

  }
  
  function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("closeBtn").style.display = "none";
    document.getElementById("openBtn").style.display = "block";

    document.getElementById("main").style.marginLeft= "0";
    
  }