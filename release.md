### Merge

Splice merges an ordered collection of records into a Strata b-tree. It does not
go to great lengths to assert that the collection is ordered.

### Issue by Issue

 * Not always deleting prior to insert. #10.
 * Retry insert by running through loop. #9.
 * Correctly unlock `Splice` when no mutator is held. #8.
 * Implement merge. #7.
