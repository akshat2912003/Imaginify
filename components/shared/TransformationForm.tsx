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

import { aspectRatioOptions, creditFee, defaultValues, transformationTypes, smartCropAspectRatios } from "@/constants";
import { addImage, updateImage } from "@/lib/actions/image.actions";
import { updateCredits } from "@/lib/actions/user.actions";
import { AspectRatioKey } from "@/lib/utils";
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

// Types that need NO extra fields — button enables as soon as image is uploaded
const NO_FIELD_TYPES = ["restore", "removeBackground", "smartcrop"];

const TransformationForm = ({ action, data = null, userId, type, creditBalance, config = null }: TransformationFormProps) => {
  const transformationType = transformationTypes[type];
  const [image, setImage] = useState(data);
  const [newTransformation, setNewTransformation] = useState<Transformations | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformationConfig, setTransformationConfig] = useState(config);
  const [smartCropRatio, setSmartCropRatio] = useState("1:1");
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

  // ✅ Auto-enable button for no-field types when image uploads
  useEffect(() => {
    if (image?.publicId && NO_FIELD_TYPES.includes(type)) {
      if (type === "smartcrop") {
        const ratio = smartCropAspectRatios[smartCropRatio as keyof typeof smartCropAspectRatios];
        // Pass width + height from the selected ratio so Cloudinary actually resizes
        setNewTransformation({
          crop: "thumb",
          gravity: "auto",
          width: ratio.width,
          height: ratio.height,
        } as any);
      } else {
        setNewTransformation(transformationType.config);
      }
    }
  }, [image?.publicId, type, smartCropRatio]);

  // ✅ For update action pre-set config
  useEffect(() => {
    if (data && action === "Update") {
      setNewTransformation(transformationType.config);
    }
  }, []);

  const onSelectFieldHandler = (value: string, onChangeField: (value: string) => void) => {
    const imageSize = aspectRatioOptions[value as AspectRatioKey];
    setImage((prevState: any) => ({
      ...prevState,
      aspectRatio: imageSize.aspectRatio,
      width: imageSize.width,
      height: imageSize.height,
    }));
    setNewTransformation(transformationType.config);
    return onChangeField(value);
  };

  const onInputChangeHandler = (fieldName: string, value: string, type: string, onChangeField: (value: string) => void) => {
    clearTimeout((window as any).debounceTimer);
    (window as any).debounceTimer = setTimeout(() => {
      setNewTransformation((prevState: any) => ({
        ...prevState,
        [type]: {
          ...prevState?.[type],
          [fieldName === "prompt" ? "prompt" : "to"]: value,
        },
      }));
    }, 400);
    return onChangeField(value);
  };

  const onTransformHandler = async () => {
    setIsTransforming(true);
    // Use the new transformation directly to avoid stale config corruption
    setTransformationConfig(newTransformation);
    setNewTransformation(null);
    startTransition(async () => {
      await updateCredits(userId, creditFee);
    });
  };

  const onSubmitHandler = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    if (data || image) {
      const transformationUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${image?.publicId}`;
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
          if (newImage) {
            form.reset();
            setImage(data);
            router.push(`/transformations/${newImage._id}`);
          }
        } catch (error) {
          toast({ title: "Error", description: "Failed to save image.", className: "error-toast" });
        }
      }

      if (action === "Update") {
        try {
          const updatedImage = await updateImage({
            image: { ...imageData, _id: data?._id || "" },
            userId,
            path: `/transformations/${data?._id}`,
          });
          if (updatedImage) router.push(`/transformations/${updatedImage._id}`);
        } catch (error) {
          toast({ title: "Error", description: "Failed to update image.", className: "error-toast" });
        }
      }
    }
    setIsSubmitting(false);
  };

  const isApplyDisabled = isTransforming || !image?.publicId || newTransformation === null;

  return (
    <Form {...form}>
      {creditBalance < Math.abs(creditFee) && <InsufficientCreditsModal />}
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-8">

        {/* Title */}
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel className="text-dark-600 font-semibold">Image Title</FormLabel>
            <FormControl>
              <Input className="input-field" placeholder="Enter a title..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {/* Generative Fill — Aspect Ratio */}
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

        {/* Smart Crop — Crop Ratio */}
        {type === "smartcrop" && (
          <div className="w-full space-y-2">
            <label className="text-dark-600 font-semibold text-sm">Crop Aspect Ratio</label>
            <Select onValueChange={(val) => setSmartCropRatio(val)} value={smartCropRatio}>
              <SelectTrigger className="select-field">
                <SelectValue placeholder="Select crop ratio" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(smartCropAspectRatios).map(([key, val]) => (
                  <SelectItem key={key} value={key} className="select-item">
                    {val.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-dark-400">AI will automatically focus on the most important subject</p>
          </div>
        )}

        {/* Object Remove / Recolor */}
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
                    placeholder={type === "remove" ? "e.g. bird, person, car..." : "e.g. shirt, jacket, bag..."}
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

        {/* Image Uploader + Transformed Preview */}
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
            disabled={isApplyDisabled}
            onClick={onTransformHandler}
          >
            {isTransforming ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin inline-block">⟳</span>
                Transforming... Please wait
              </span>
            ) : (
              "Apply Transformation"
            )}
          </Button>

          <Button
            type="submit"
            className="submit-button capitalize"
            style={{ background: "#2B3674" }}
            disabled={isSubmitting || isTransforming}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin inline-block">⟳</span>
                Saving...
              </span>
            ) : (
              "Save Image"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TransformationForm;
