Here's a choice to make; in the case of amalgamate, or the other operations in
Locket, there is no real race condition. We are the only ones manipulating a set
of keys, so when we let go and grab again to insert on the next leaf page, we
don't have to worry about having to re-delete. For some other application,
perhaps, but not in our MVCC application.

Otherwise, and in the case of races, operation might get called more than once
for a particular record, to resolve race conditions. That is actually easier to
document than the requirement that race conditions should be avoided.
