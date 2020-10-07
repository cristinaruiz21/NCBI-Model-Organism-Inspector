let orgQueryID = "";
let chosenProtein = "";
let geneToStructLinks = "";

// //* Preset choices => "HSV1" "HIV" "tobacco_mosaic_virus"
// // Get the genes for organism to be studied
// // TODO interpolate user choice of model organism
// $.ajax({
//   url: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=gene&term=hiv[organism]&retmax=1000&retmode=JSON`,
//   method: "GET",
// }).then(function (response) {
//   console.log(response);
//   //!! Save the list of UIDs
//   orgQueryID = response.esearchresult.idlist;

//   // Get the names of the genes

//   $.ajax({
//     url: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=gene&term=Tobacco_mosaic_virus[organism]&ID=${orgQueryID}&retmode=JSON`,
//     method: "GET",
//   }).then(function (response) {
//     console.log(response);
//     //!! This is the location of the list protein names
//     for (let i = 0; i < orgQueryID.length; i++) {
//       console.log(`Logging a name -- ${response.result[orgQueryID[i]].name}`);
//     }
//     // TODO User choice ID to be set here
//     // TODO on click event to call never ajax after user choice
//     chosenProtein = orgQueryID;
//     console.log(`Chosen protein ID = ${chosenProtein}`);

//     // Link the gene DB to the structure DB

//     $.ajax({
//       url: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?dbfrom=gene&db=structure&id=${chosenProtein}&retmode=JSON`,
//       method: "GET",
//     }).then(function (response) {
//       console.log(response);
//       // !! This is a list of of links from gene to struct UIDs
//       geneToStructLinks = response.linksets[0].linksetdbs[0].links;
//       console.log(`Here are the UIDs from structure db ${geneToStructLinks}`);
//       $(document).ready(function () {
//         var options = {};

//         //Options are available at: https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html#DisplayOptions
//         //options['proteins'] = 'sphere';

//         var cfg = {
//           divid: "icn3dwrap",
//           width: "100%",
//           height: "100%",
//           resize: true,
//           rotate: "right",
//           mobilemenu: true,
//           showcommand: false,
//           showtitle: false,
//         };
//         //! This is where we feed UIDs
//         cfg["mmdbid"] = `${geneToStructLinks[0]}`;
//         if (Object.keys(options).length > 0) cfg["options"] = options;

//         var icn3dui = new iCn3DUI(cfg);

//         //communicate with the 3D viewer with chained functions
//         $.when(icn3dui.show3DStructure()).then(function () {
//           //icn3dui.setOption('color', 'cyan');
//         });
//       });

//       // Get structure for gene product
//       // TODO use structure UIDs to generate a iCn3D query
//       // TODO Render iCn3D window
//     });
//   });
// });

async function fetchGenes(organism) {
  let { esearchresult } = await $.get(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=gene&term=${organism}[organism]&retmax=1000&retmode=JSON&key=1c1a030e06f70a410fc507821bb474459d08`)

  $.get(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=gene&term=${organism}[organism]&ID=${esearchresult.idlist}&retmode=JSON&key=1c1a030e06f70a410fc507821bb474459d08`)
    .then(res => {
      for (let uid of res.result.uids) {
        console.log(res.result[uid]);
      }

      $('.container').first().append(
        $('<ul>')
          .addClass('proteins-list')
          .append(
            res.result.uids
              .map(uid => res.result[uid])
              .filter(geneInfo => geneInfo.name !== 'NEWENTRY')
              .map(geneInfo => 
                $('<li>')
                  .text(geneInfo.name)
                  .on('click', e => fetchProtein(geneInfo.uid))
              )
          )
      );
    });
}

async function fetchProtein(uid) {
  $.ajax({
      url: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?dbfrom=gene&db=structure&id=${uid}&retmode=JSON&key=1c1a030e06f70a410fc507821bb474459d08`,
      method: "GET",
    }).then(function (response) {
      console.log(response);
      // !! This is a list of of links from gene to struct UIDs
      if (!response.linksets.hasOwnProperty('linksetdbs')) {
        $('.proteins-list')
          .before(
            $('<div>')
              .addClass('toast toast-error')
              .text('No protein visualization could be found :/')
              .append(
                $('<button>')
                  .addClass('btn btn-clear float-right')
                  .on('click', function (e) {
                    $(this).parent().remove();
                  })
              )
          )
        return;
      }
      geneToStructLinks = response.linksets[0].linksetdbs[0].links;
      console.log(`Here are the UIDs from structure db ${geneToStructLinks}`);
      $(document).ready(function () {
        var options = {};

        //Options are available at: https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html#DisplayOptions
        //options['proteins'] = 'sphere';

        var cfg = {
          divid: "icn3dwrap",
          width: "100%",
          height: "100%",
          resize: true,
          rotate: "right",
          mobilemenu: true,
          showcommand: false,
          showtitle: false,
        };
        //! This is where we feed UIDs
        cfg["mmdbid"] = `${geneToStructLinks[0]}`;
        if (Object.keys(options).length > 0) cfg["options"] = options;

        var icn3dui = new iCn3DUI(cfg);

        //communicate with the 3D viewer with chained functions
        $.when(icn3dui.show3DStructure()).then(function () {
          //icn3dui.setOption('color', 'cyan');
        });
      });

      // Get structure for gene product
      // TODO use structure UIDs to generate a iCn3D query
      // TODO Render iCn3D window
    });
}

fetchGenes('tobacco_mosaic_virus')
