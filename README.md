# Fixture generator

## Redesign notes

### Process
1. Create generic mock templates for atom items:
    * Location ids
    * Jobs, Employees, Categories, Discounts, Voids, Items, etc. - all the config related entities
    * Transaction items
2. Create generic mock templates for container items:
3. Create mappings for specific integrations
4. Create rules for dependencies between atom items
5. Create generic code for building the final schemas
6. Generate the final json data based on the schemas
7. Feed it to a plugabble-interface-based formatter like `--output=xml --output=csv --output=pdf` or whatever we need
8. Possibly include extension points in the process for injecting custom transformers/formatters if needed
9.  design it as a lib
10. Think about how to pass arguments into the schemas/templates

### Relations between entities
1. Employees require Jobs
2. Items require Categories
3. Transactions require Items, Employees
4. Timeslips require Locations, Employees, Jobs but the Jobs should be assigned to the employees on the config level

### Other considerations
1. Many of the entities require calculations, I found using the virtual items useful for that
