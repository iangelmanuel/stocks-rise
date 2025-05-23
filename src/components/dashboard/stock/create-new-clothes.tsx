"use client"

import type { TransitionStartFunction } from "react"
import { useState, useTransition } from "react"
import Image from "next/image"
import { createClothesCollection } from "@/actions/stock/create-clothes-collection"
import { ButtonContentLoading } from "@/components/shared/button-content-loading"
import { ErrorFormMessage } from "@/components/shared/error-form-message"
import { Button } from "@/components/ui/button"
import { Card, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EXISTANT_SIZES } from "@/constants/existant-sizes"
import { stockValidation } from "@/form-config/stock"
import type { CreateClotheStockForm } from "@/types/stock"
import type { Clothes, Collection } from "@prisma/client"
import { ChevronDown, Upload } from "lucide-react"
import Dropzone from "react-dropzone"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

type Props = {
  collectionData: {
    id: Collection["id"]
    name: Collection["name"]
  }
}

export function CreateNewClothes({ collectionData }: Props) {
  const [isPending, startTransition] = useTransition()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Create Clothes Variant</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Create a new Clothes Variant</DialogTitle>
          <DialogDescription>
            Create a new clothes variant for this collection. You can add
            multiple variants to a single collection.
          </DialogDescription>
        </DialogHeader>

        {/* Form */}
        <CreateNewClothesForm
          collectionData={collectionData}
          startTransition={startTransition}
        />

        <DialogFooter>
          <Button
            type="submit"
            disabled={isPending}
            form="create-clothes-variant"
          >
            <ButtonContentLoading
              label="Create Clothes"
              isPending={isPending}
            />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CreateNewClothesForm({
  collectionData,
  startTransition
}: {
  collectionData: Props["collectionData"]
  startTransition: TransitionStartFunction
}) {
  const [image, setImage] = useState<File | undefined>(undefined)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<CreateClotheStockForm>()

  const onSubmit = async (data: CreateClotheStockForm) => {
    const formData = new FormData()
    if (image) formData.append("image", image)

    const { image: _, price, stock, ...rest } = data
    const newClothes = {
      ...rest,
      price: Number(price),
      stock: stock.map((stock) => ({
        size: stock.size,
        stock: Number(stock.stock)
      })),
      image: formData
    }

    startTransition(async () => {
      const { ok, message } = await createClothesCollection(
        collectionData,
        newClothes
      )

      if (ok) {
        toast.success("The new clothes has been successfully created.", {
          description: message,
          duration: 2000,
          position: "top-center"
        })
        reset()
        setImage(undefined)
      } else {
        toast.error("Error creating the new clothes.", {
          description: message,
          duration: 2000,
          position: "top-center"
        })
      }
    })
  }

  return (
    <form
      id="create-clothes-variant"
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2"
    >
      <div className="grid gap-4">
        <span className="text-center text-lg font-bold">Clothes Info</span>

        <div className="grid gap-2">
          <Label htmlFor="design">Design name</Label>

          <Input
            type="text"
            id="design"
            placeholder="Ej. Last Dinner"
            className="col-span-3"
            {...register("design", stockValidation.design)}
          />

          {errors.design && (
            <ErrorFormMessage message={errors.design.message} />
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="color">Color</Label>

          <Input
            type="text"
            id="color"
            placeholder="Ej. Black"
            className="col-span-3"
            {...register("color", stockValidation.color)}
          />

          {errors.color && <ErrorFormMessage message={errors.color.message} />}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="price">Price</Label>

          <Input
            type="number"
            id="price"
            placeholder="Ej. 80000"
            className="col-span-3"
            {...register("price", stockValidation.price)}
          />

          {errors.price && <ErrorFormMessage message={errors.price.message} />}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="image">Image</Label>

          <Dropzone
            onDrop={(acceptedFiles) => {
              setImage(acceptedFiles ? acceptedFiles[0] : undefined)
              setValue("image", acceptedFiles[0])
            }}
          >
            {({ getRootProps, getInputProps, isDragActive }) => (
              <Card className="cursor-pointer py-1.5">
                <div {...getRootProps()}>
                  <input
                    id="image"
                    {...getInputProps({
                      multiple: false,
                      accept: "image/*",
                      max: 1
                    })}
                  />

                  {isDragActive ? (
                    <>
                      <ChevronDown
                        size={30}
                        className="text-muted-foreground m-auto"
                      />
                      <CardDescription className="mt-2 text-center">
                        Drop the files here...
                      </CardDescription>
                    </>
                  ) : (
                    <>
                      <Upload
                        size={30}
                        className="text-muted-foreground m-auto"
                      />
                      <CardDescription className="mt-2 text-center">
                        Drag and drop your images here
                      </CardDescription>
                    </>
                  )}
                </div>
              </Card>
            )}
          </Dropzone>

          {errors.image && (
            <ErrorFormMessage message={errors.image.message as string} />
          )}

          {image !== undefined && (
            <div className="mt-2 flex items-center justify-center">
              <Image
                key={image.name}
                src={URL.createObjectURL(image)}
                alt={image.name}
                width={128}
                height={128}
                className="h-32 w-32 rounded-md object-cover"
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        <span className="text-center text-lg font-bold">Stocks</span>

        {EXISTANT_SIZES.map((size, index) => (
          <div
            key={size}
            className="grid gap-2"
          >
            <Label
              htmlFor={`stock.${index}.stock`}
              className="capitalize"
            >
              {size}
            </Label>

            <Input
              type="hidden"
              value={size}
              {...register(`stock.${index}.size`, stockValidation.size)}
            />

            <Input
              type="number"
              id={`stock.${index}.stock`}
              placeholder="Ej. 5"
              className="col-span-3"
              {...register(`stock.${index}.stock`, stockValidation.stock)}
            />

            {errors.stock && (
              <ErrorFormMessage message={errors.stock.message} />
            )}
          </div>
        ))}
      </div>
    </form>
  )
}
