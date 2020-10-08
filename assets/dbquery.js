

async function fetchGenes(organism) {
  // list of genes
  let { esearchresult } = await $.get(
    `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=gene&term=${organism}[organism]&retmax=1000&retmode=JSON&key=1c1a030e06f70a410fc507821bb474459d08`
  );
  console.log(esearchresult);
  // Gene to Structure conversion
  $.get(
    `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?dbfrom=gene&db=structure&id=${esearchresult.idlist}&retmode=JSON&key=1c1a030e06f70a410fc507821bb474459d08`
  ).then((res) => {
    console.log(res);
    let structs = res.linksets[0].linksetdbs[0].links;
    /* for (let uid of res.result.uids) {
            console.log(res.result[uid]);
            console.log(result);
          } */
    $.ajax({
      url: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=structure&term=${organism}[organism]&ID=${structs}&retmax=1000&retmode=JSON`,
      method: "GET",
    }).then(function (response) {
      console.log(response);
      //!! Save the list of UIDs
    });
    $(".container")
      .first()
      .append(
        $("<ul>")
          .addClass("proteins-list")
          .append(
            res.result.uids
              .map((uid) => structs)
              .filter((geneInfo) => geneInfo.name !== "NEWENTRY")
              .map((geneInfo) =>
                $("<li>")
                  .text(geneInfo.name)
                  .on("click", (e) => fetchProtein(geneInfo.uid))
              )
          )
      );
  });
}

fetchGenes("hiv");
