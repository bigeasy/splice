### Merge

Splice merges an ordered collection of records into a Strata b-tree. It does not
go to great lengths to assert that the collection is ordered.

### Issue by Issue

 * Correctly unlock `Splice` when no mutator is held. #8.
 * Implement merge. #7.
