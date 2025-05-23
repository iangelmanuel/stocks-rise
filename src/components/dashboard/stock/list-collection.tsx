import { Fragment } from "react"
import Link from "next/link"
import { getAllCollection } from "@/actions/stock/get-all-collection.action"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"

export const ListCollection = () => {
  return (
    <section className="mt-10">
      <Table>
        <TableCaption>A list of Rise&aops;s collection</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="border-t p-5 text-center">Name</TableHead>
            <TableHead className="border-t p-5 text-center">
              Number of clothes
            </TableHead>
            <TableHead className="border-t p-5 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <CollectionRow />
        </TableBody>
      </Table>
    </section>
  )
}

async function CollectionRow() {
  const collection = await getAllCollection()

  return (
    <TableRow>
      {collection && collection.length > 0 ? (
        collection.map((item) => (
          <Fragment key={item.id}>
            <TableCell className="text-center font-medium">
              {item.name}
            </TableCell>

            <TableCell className="text-center font-medium">
              {item.clothes.length}
            </TableCell>

            <TableCell className="text-center font-medium">
              <Link
                href={`/dashboard/stocks/${item.id}`}
                className="text-blue-300 hover:text-blue-500 hover:underline"
              >
                Go to the collection
              </Link>
            </TableCell>
          </Fragment>
        ))
      ) : (
        <TableCell
          colSpan={4}
          className="text-center"
        >
          No collection available
        </TableCell>
      )}
    </TableRow>
  )
}
