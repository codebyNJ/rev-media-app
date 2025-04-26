
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Constants } from "@/integrations/supabase/types";

// Use the company names from Constants instead of Database type
const companyNames = Constants.public.Enums.company_name;
type CompanyName = typeof companyNames[number];

// Convert the readonly array to a mutable array for zod schema
const mutableCompanyNames = [...companyNames] as [CompanyName, ...CompanyName[]];

const formSchema = z.object({
  company_name: z.enum(mutableCompanyNames),
  time_slot: z.number().min(1, "Time slot must be greater than 0"),
});

export type MediaDetailsFormData = z.infer<typeof formSchema>;

type MediaDetailsFormProps = {
  onSubmit: (data: MediaDetailsFormData) => void;
};

export function MediaDetailsForm({ onSubmit }: MediaDetailsFormProps) {
  const form = useForm<MediaDetailsFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: companyNames[0],
      time_slot: 1,
    },
  });

  const handleSubmit = (data: MediaDetailsFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="company_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {companyNames.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="time_slot"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time Slot (minutes)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="1"
                  {...field}
                  onChange={e => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">Upload Media</Button>
      </form>
    </Form>
  );
}
