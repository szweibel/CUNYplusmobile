## API
The CUNY+ Catalog API is currently located at http://mighty-wildwood-7308.herokuapp.com/. It replicates the main functions of searching the catalog, providing results that can be used for creating new apps that take advantage of CUNY's holdings and metadata.

An example query: 

http://mighty-wildwood-7308.herokuapp.com/search?query=global+warming&queryType=All+Fields&school=HUNTER

And for a demonstration of what can be done with it: 

http://cunycatalog.site44.com/

## Basic Search
To do a search for 'global warming' in Hunter College:
/search?query=global+warming&queryType=All+Fields&school=HUNTER

The API will return a list of items from the catalog:
```
{
      "title": "Advanced statistical methods for the analysis of large data-sets",
      "author": "Di Ciaccio, Agostino.",
      "year": "2012",
      "resourceType": "Electronic Resource",
      "library": "Hunter Main",
      "thumbnail": "http://syndetics.com/index.aspx?isbn=9783642210372 (electronic bk.)/SC.GIF&client=cunyh&type=xw12",
      "docNumber": "007268706",
      "libraryCode": "HC001"
}
```
To change the query type, replace the value of 'queryType':
```
All Fields: All fields
TTL: Title
AUT: Author
SHL: Call Number
SUL: Subject
ISBN: ISBN
```
To choose which school's catalog to search, replace the value of 'school':
```
BOROUGH: BMCC
BRONX: Bronx CC
BROOKLYN: Brooklyn College
CENTRO: Centro at Hunter
CITY: City College and DSI
STATENISLAND: College of Staten Island
GRADCENTER: Graduate Center
JOURNALISM: Graduate School of Journalism
HOSTOS: Hostos CC
HUNTER: Hunter College
JOHNJAY: John Jay College
KINGSBOROUGH: Kingsborough CC
LAGUARDIA: LaGuardia CC
LAW: Law School
LEHMAN: Lehman College
MEDGAR: Medgar Evers College
NYCITY: NYCCT
QUEENS: Queens College
QUEENSBOROUGH: Queensborough
```
## Barcodes
Similarly you can search using a barcode number:
/search?barcode=31407007890312

## MARC Records
To get a MARC record, all that is required is a "document number", for instance:
/marc?docNumber=007269583

## Holding Records
To get a holding record from a specific library requires a document number and the library code, provided by using the '/search' API:
/details?docNumber=007268706&library=HC001
