let structureHistory = {
  _maxLength: 5,
  _storageKey: 'structureHistory',
  _items: [],

  _enqueue(pdbid, structure) {
    this._items.unshift({pdbid, structure});
  },

  _dequeue() {
    this._items.pop();
  },

  addStructure(pdbid, structure) {
    // If the structure already exists, just move it to the top of the structureHistory
    let existing = this._items.find(v => v.pdbid === pdbid);
    if (existing !== undefined) {
      let existingIndex = this._items.indexOf(existing);
      this._items.splice(existingIndex, 1);
      this._enqueue(existing);
    } else {
      console.log('Adding structure')
      this._enqueue(pdbid, structure);
      this._items.length > this._maxLength && this._dequeue();
    }
  },

  getIfPresent(pdbid) {
    return this._items.find(v => v.pdbid === pdbid);
  },

  save() {
    localStorage.setItem(this._storageKey, JSON.stringify(this._items));
  },

  load() {
    this._items = JSON.parse(localStorage.getItem(this._storageKey)) ?? [];
  }
}

$(document).ready(() => {
  structureHistory.load();
});

window.onunload = () => {
  structureHistory.save();
}

async function fetchGenes(organism) {
  // list of genes
  let { esearchresult } = await $.get(
    `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=gene&term=${organism}[organism]&retmax=1000&retmode=JSON&key=1c1a030e06f70a410fc507821bb474459d08`
  );
  $(".container").addClass("hide");
  $("#question2").removeClass("hide");
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
      $('.proteins-list')
        .empty()
        .append(
          response.result.uids
            .map(uid => response.result[uid])
            .map(info => 
              $('<li>')
                .addClass('tooltip')
                .attr('data-tooltip', info.pdbdescr)
                .text(info.pdbacc)
                .on('click', e => displayStructure(info.pdbacc))
            )
        )
    });
  });
}

function displayStructure(pdbid) {
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
    showtitle: true,
  };
  //! This is where we feed UIDs
  cfg["mmdbid"] = pdbid;
  if (Object.keys(options).length > 0) cfg["options"] = options;

  var icn3dui = structureHistory.getIfPresent(pdbid) ?? new iCn3DUI(cfg);
  structureHistory.addStructure(pdbid, icn3dui);

  //communicate with the 3D viewer with chained functions
  $.when(icn3dui.show3DStructure()).then(function () {
    //icn3dui.setOption('color', 'cyan');
  });
}

$('.btn-organism').on('click', function (e) {
  fetchGenes($(this).attr('data-organism'));
});

