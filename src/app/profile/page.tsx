'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { PlaceHolderImages } from '@/lib/placeholder-images'

const profileSchema = z.object({
  fullName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  bio: z.string().max(160, { message: 'Bio must not be longer than 160 characters.' }).optional(),
  github: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  linkedin: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  primarySkill: z.enum(['Frontend', 'Backend', 'Full Stack', 'DevOps', 'UI/UX']),
  learningPace: z.enum(['Casual', 'Moderate', 'Intense']),
})

export default function ProfilePage() {
  const { toast } = useToast()
  const userAvatar = PlaceHolderImages.find((p) => p.id === 'avatar-1')

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: 'Alice',
      bio: 'Frontend developer passionate about React and building beautiful UIs.',
      github: 'https://github.com/alice',
      linkedin: 'https://linkedin.com/in/alice',
      primarySkill: 'Frontend',
      learningPace: 'Moderate',
    },
  })

  function onSubmit(values: z.infer<typeof profileSchema>) {
    console.log(values)
    toast({
      title: 'Profile Updated',
      description: 'Your changes have been saved successfully.',
    })
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-8">
        My Profile
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            This information will be used to match you with a learning group.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={userAvatar?.imageUrl} />
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <Button type="button" variant="outline">Change Photo</Button>
              </div>

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us a little bit about yourself"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="github"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub Profile</FormLabel>
                      <FormControl>
                        <Input placeholder="https://github.com/your-username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="linkedin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn Profile</FormLabel>
                      <FormControl>
                        <Input placeholder="https://linkedin.com/in/your-username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="primarySkill"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Skill</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your main area of focus" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Frontend">Frontend</SelectItem>
                        <SelectItem value="Backend">Backend</SelectItem>
                        <SelectItem value="Full Stack">Full Stack</SelectItem>
                        <SelectItem value="DevOps">DevOps</SelectItem>
                        <SelectItem value="UI/UX">UI/UX</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      This will help us match you with the right group.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="learningPace"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Preferred Learning Pace</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Casual" />
                          </FormControl>
                          <Label className="font-normal">
                            Casual (a few hours a week)
                          </Label>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Moderate" />
                          </FormControl>
                          <Label className="font-normal">
                            Moderate (5-10 hours a week)
                          </Label>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Intense" />
                          </FormControl>
                          <Label className="font-normal">
                            Intense (10+ hours a week)
                          </Label>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit">Update Profile</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
