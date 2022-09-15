A pdf-generation system as website printing utility, using Node.js and puppetter.  

## HOW TO USE

### PREREQUISITES

A directory structure shown below is required to run.  
Root is Nope project root.

```
├─file
│  ├─created-pdf
│  ├─input
│  ├─output-picked-target
│  ├─output-result-of-pdf-sanity
│  ├─output-result-of-scraping
│  └─output-robots
├─log
│      uncaughtCommon.log
│      warnCommon.log
```

### SET TARGET URL LIST CSV

Create and set a csv described as target url list in /file/input directory.

### CHECK IF THE PAGE IS ALLOWED TO SCRAPE

Run the command `check-if-allowed-to-scrape` to check if a page corresponding to a url in list is allowed to scrape.

### CREATE PDF
Run the command `create-pdf` to launch headless browser, scrape a website and save the page as PDF file.
### CHECK CREATED PDF'S SANITY
Run the command `check-pdf-sanity` to check if created PDF files are not broken.
### DELETE STALE FILES
Run the command `delete-stale-files` to delete stale files in preparation for the next run.



