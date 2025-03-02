for (const doc of legacyDocs) {
  // Check if the legacy fields exist
  if (doc.company && doc.boxCount != null) {
    // Lookup the company to determine the mainBrand
    const existingCompany = await ThreadBrand.findById(doc.company);
    let mainBrand;
    if (existingCompany) {
      // Use the parentBrand if available; otherwise, fallback to the company itself.
      mainBrand = existingCompany.parentBrand
        ? existingCompany.parentBrand.toString()
        : existingCompany._id.toString();
    } else {
      // If no company record exists, fallback to the old company id.
      mainBrand = doc.company;
    }

    // Migrate the legacy fields into the new structure.
    doc.entries = [{ company: doc.company, boxCount: doc.boxCount }];
    doc.mainBrand = mainBrand;

    // Optionally remove the legacy fields.
    doc.company = undefined;
    doc.boxCount = undefined;

    await doc.save();
    console.log(`Migrated document with challanNo ${doc.challanNo}`);
  } else {
    console.log(
      `Skipping document with challanNo ${doc.challanNo} (not legacy)`
    );
  }
}
console.log("Migration completed.");
