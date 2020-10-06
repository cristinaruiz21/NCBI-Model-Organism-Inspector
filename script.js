let orgQueryID = ""
let chosenProtein = ""
let geneToStructLinks = ""

// Get the genes for organism to be studied
// TODO interpolate user choice of model organism
$.ajax({
    url: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=gene&term=Tobacco_mosaic_virus&retmax=1000&retmode=JSON`,
    method: "GET",
  }).then(function (response) {
    console.log(response);
    console.log(response.esearchresult.idlist);
    // Save the list of UIDs
    orgQueryID = response.esearchresult.idlist;

    // Get the names of the genes

    $.ajax({
        url: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=gene&term=Tobacco_mosaic_virus&ID=${orgQueryID}&retmode=JSON`,
        method: "GET",
      }).then(function (response) {
        console.log(response);
        // TODO User choice ID to be set here
        chosenProtein = orgQueryID[8];
        console.log(`Chosen protein ID = ${chosenProtein}`);

        // Link the gene DB to the structure DB
        
        $.ajax({
            url: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?dbfrom=gene&db=structure&id=${chosenProtein}&retmode=JSON`,
            method: "GET",
          }).then(function (response) {
            console.log(response);
            geneToStructLinks = response.linksets[0].linksetdbs[0].links;
            console.log(`Here are the links from structure db ${geneToStructLinks}`)
            // Get structure for gene product
            // TODO use structure UIDs to generate a iCn3D query
            $.ajax({
                url: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=structure&id=${geneToStructLinks}&retmode=JSON`,
                method: "GET",
              }).then(function (response) {
                console.log(response);
                chosenProtein = response;
                
              });
          });
      });
  });
  
  
  
  
 