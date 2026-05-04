"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { aspectRatioOptions, creditFee, defaultValues, transformationTypes } from "@/constants";
import { addImage, updateImage } from "@/lib/actions/image.actions";
import { updateCredits } from "@/lib/actions/user.actions";
import { AspectRatioKey, deepMergeObjects } from "@/lib/utils";
import { IImage } from "@/lib/database/models/image.model";
import MediaUploader from "./MediaUploader";
import TransformedImage from "./TransformedImage";
import { InsufficientCreditsModal } from "./InsufficientCreditsModal";

export const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  aspectRatio: z.string().optional(),
  color: z.string().optional(),
  prompt: z.string().optional(),
  publicId: z.string(),
});

const TransformationForm = ({ action, data = null, userId, type, creditBalance, config = null }: TransformationFormProps) => {
  const transformationType = transformationTypes[type];
  const [image, setImage] = useState(data);
  const [newTransformation, setNewTransformation] = useState<Transformations | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformationConfig, setTransformationConfig] = useState(config);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const initialValues = data && action === "Update"
    ? { title: data?.title, aspectRatio: data?.aspectRatio, color: data?.color, prompt: data?.prompt, publicId: data?.publicId }
    : defaultValues;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  const onSelectFieldHandler = (value: string, onChangeField: (value: string) => void) => {
    const imageSize = aspectRatioOptions[value as AspectRatioKey];
    setImage((prevState: any) => ({ ...prevState, aspectRatio: imageSize.aspectRatio, width: imageSize.width, height: imageSize.height }));
    setNewTransformation(transformationType.config);
    return onChangeField(value);
  };

  const onInputChangeHandler = (fieldName: string, value: string, type: string, onChangeField: (value: string) => void) => {
    clearTimeout((window as any).debounceTimer);
    (window as any).debounceTimer = setTimeout(() => {
      setNewTransformation((prevState: any) => ({ ...prevState, [type]: { ...prevState?.[type], [fieldName === "prompt" ? "prompt" : "to"]: value } }));
    }, 400);
    return onChangeField(value);
  };

  const onTransformHandler = async () => {
    setIsTransforming(true);
    setTransformationConfig(deepMergeObjects(newTransformation, transformationConfig));
    setNewTransformation(null);
    startTransition(async () => {
      await updateCredits(userId, creditFee);
    });
  };

  const onSubmitHandler = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    if (data || image) {
      const transformationUrl = getCldImageUrl({ publicId: image?.publicId || "", ...transformationConfig });
      const imageData = {
        title: values.title,
        publicId: image?.publicId || "",
        transformationType: type,
        width: image?.width || 0,
        height: image?.height || 0,
        config: transformationConfig,
        secureURL: image?.secureURL || "",
        transformationURL: transformationUrl,
        aspectRatio: values.aspectRatio,
        prompt: values.prompt,
        color: values.color,
      };
      if (action === "Add") {
        try {
          const newImage = await addImage({ image: imageData, userId, path: "/" });
          if (newImage) { form.reset(); setImage(data); router.push(`/transformations/${newImage._id}`); }
        } catch (error) { toast({ title: "Error", description: "Failed to save image.", className: "error-toast" }); }
      }
      if (action === "Update") {
        try {
          const updatedImage = await updateImage({ image: { ...imageData, _id: data?._id || "" }, userId, path: `/transformations/${data?._id}` });
          if (updatedImage) router.push(`/transformations/${updatedImage._id}`);
        } catch (error) { toast({ title: "Error", description: "Failed to update image.", className: "error-toast" }); }
      }
    }
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      {creditBalance < Math.abs(creditFee) && <InsufficientCreditsModal />}
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-8">
        {/* Title */}
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel className="text-dark-600 font-semibold">Image Title</FormLabel>
            <FormControl><Input className="input-field" placeholder="Enter a title..." {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {/* Generative Fill aspect ratio */}
        {type === "fill" && (
          <FormField control={form.control} name="aspectRatio" render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="text-dark-600 font-semibold">Aspect Ratio</FormLabel>
              <FormControl>
                <Select onValueChange={(value) => onSelectFieldHandler(value, field.onChange)} value={field.value}>
                  <SelectTrigger className="select-field">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(aspectRatioOptions).map((key) => (
                      <SelectItem key={key} value={key} className="select-item">
                        {aspectRatioOptions[key as AspectRatioKey].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        )}

        {/* Prompt fields for remove/recolor */}
        {(type === "remove" || type === "recolor") && (
          <div className="prompt-field">
            <FormField control={form.control} name="prompt" render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-dark-600 font-semibold">
                  {type === "remove" ? "Object to Remove" : "Object to Recolor"}
                </FormLabel>
                <FormControl>
                  <Input
                    value={field.value}
                    className="input-field"
                    placeholder={type === "remove" ? "e.g. bird, person, car..." : "e.g. shirt, jacket..."}
                    onChange={(e) => onInputChangeHandler("prompt", e.target.value, type, field.onChange)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {type === "recolor" && (
              <FormField control={form.control} name="color" render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-dark-600 font-semibold">Replacement Color</FormLabel>
                  <FormControl>
                    <Input
                      value={field.value}
                      className="input-field"
                      placeholder="e.g. red, blue, #ff0000..."
                      onChange={(e) => onInputChangeHandler("color", e.target.value, "recolor", field.onChange)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            )}
          </div>
        )}

        {/* Image uploader and transformed image */}
        <div className="media-uploader-field">
          <FormField control={form.control} name="publicId" render={({ field }) => (
            <FormItem className="flex size-full flex-col">
              <FormControl>
                <MediaUploader
                  onValueChange={field.onChange}
                  setImage={setImage}
                  publicId={field.value}
                  image={image}
                  type={type}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <TransformedImage
            image={image}
            type={type}
            title={form.getValues().title}
            isTransforming={isTransforming}
            setIsTransforming={setIsTransforming}
            transformationConfig={transformationConfig}
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4">
          <Button
            type="button"
            className="submit-button capitalize"
            disabled={isTransforming || newTransformation === null}
            onClick={onTransformHandler}
          >
            {isTransforming ? "Transforming..." : "Apply Transformation"}
          </Button>
          <Button type="submit" className="submit-button capitalize bg-dark-600" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Image"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TransformationForm;

function getCldImageUrl(options: any) {
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${options.publicId}`;
}
