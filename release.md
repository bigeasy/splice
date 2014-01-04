### Recalculate Insert After Delete

Now recalculating the insert index after deleting the record. If the record is
the first record in the leaf page, it's index is zero. After it is deleted it's
index will be one. Inserting in the zero index of a leaf page that is not the
left most leaf page raises an error. The zero index record is only ever supposed
to be changed by a balance operation, it is the key for the leaf page and it is
used in the branch pages to find the leaf page.

The zero index record is never actually deleted, it is marked as a ghost. Thus,
when we delete then insert the record at the zero index we actually mark the
record at the zero index as a ghost, then insert an unghosted record after it.

The correct behavior is implemented by requesting the index for the insert using
`indexOf` after the delete, to ask again having deleted from the page.

### Issue by Issue

 * Recalculate insert index after remove. #12.
