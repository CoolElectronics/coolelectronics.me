{"title":"Breaking chromeOS's enrollment security model: Part 4","description":"by r58playz", "date":"5/17/2023"}
<script defer>
document.getElementById("innercontent").remove();
if (confirm("redirect to r58playz.dev to see post?")){
        window.location =  "https://r58playz.dev/post/breaking-cros-4"
    }
</script>
lilac
I'm not going to talk a lot about this, since there's a whole blog post about it on my site, but I'll quickly sum it up. Read the other post if you want an in-depth explanation. Lilac is a chromeOS device policy editor, like Pollen which was mentioned in post 3 of this series. Instead of inserting an undocumented file in the rootfs which requires you to disable rootfs verification for persistence, it directly modifies and re-signs the policy blob.

image of a ChromeOS VM whose policy has been patched with lilac

ecELEVATOR
Back in... January of 2023 (I had to go look at old messages, it feels so long ago), aub, CoolElectronics, OlyB, kaitlin and some others including me were talking about how Google can't patch sh1mmer without inadvertently patching downgrading in the progress. I knew that the recovery process has a postinstall section where some sort of dm-verity is set up based on logs (haven't really looked into that) and more importantly, the firmware is updated. I jokingly suggested that someone should perform an EC (embedded controller) reset before the post-install scripts run. At that time I probably thought that something would break, but...

image of ecELEVATOR in action

here we are with chromeOS 72 on an octopus chromebook.

crosvm
More recently, I decided to figure out how to get chromeOS running in a VM. It took, no I'm not kidding, a few minutes worth of searching through code to convert ChromeOS Flex into ChromeOS, except without ARC++/ARCVM (the android subsystem). Google can easily create builds of ChromeOS for VMs but why would they ever do that? Anyways, back to converting ChromeOS Flex into ChromeOS. Here's the culprit on line 522:

image of Chromium Code Search open to file src/platform2/login_manager/chrome_setup.cc; line 522 is highlighted; reven_branding is in the search bar.

Let's try enrolling and... it doesn't work and the error mentions something about "install attributes invalid". I spent some more time on this, but eventually just decided to go with a swtpm + qemu emulated tpm setup. I mostly switched over to working on fake_dmserver now, but I did spend some time trying to get ARCVM working and eventually gave up. A few days ago I started trying to patch a regular Chromebook image to work with VMs and non-chromebook hardware in general, but I'm still working on that. Once I have it working, I'll probably put it up on GitHub and update this post with the link. Check back later!

Remember back in part 3 when CoolElectronics said:

(If you’re wondering why we didn’t use flex, it has its own weird code setting it apart from stock chromeOS that makes it so it would be infeasible to make it pretend it was a normal chromebook)

Yeah, that's false now, we can bypass it with a one line change! Really makes me wonder how much of chromeOS is held up with shoestrings and packaging tape like this...

fake_dmserver
After getting crosvm working, I was aimlessly looking at Code Search (yes I do that now) when I found this interesting folder:

image of Chromium Code Search open to folder components/policy/test_support

From looking through the code, it functions basically as a local clone of the device management server at https://m.google.com/devicemanagement/data/api (codesearch link), intended to be used for tests. Off I go compiling most of Chromium with my very bad processor!

There's barely any documentation on fake_dmserver in the Chromium repos and such is the case with most of chromeOS, usually it's outdated or nonexistent. I'll skip straight to how to use fake_dmserver instead of making you read about me debugging:

How exactly to use fake_dmserver
Compile it
Run it
???
Profit
Nah, if it was that easy any regular TN greyname/skid could do it. You first have to clone ALL of the chromium source, which I'll link the Chromium guide for; luckily these docs are mostly up to date.

Continue on by generating a build directory: gn gen out/Debug or whatever folder you want.

Start the build: autoninja -C out/Debug components/policy/test_support:fake_dmserver.

You hopefully now have a built fake_dmserver binary that either took days of your life to build or a few hours depending on your hardware.

Create a policy.json (no this is NOT the policy file I haven't figured out how to set policies yet) file with the following contents:

{
    "managed_users" : [ "*", "<any old google account email which will be used for enrollment>" ],
    "policy_user" : "<that same email>",
    "use_universal_signing_keys": true,
    "allow_set_device_attributes": true
}
Create an empty state.json file with {} in it to hopefully pacify fake_dmserver.

You can now safely run fake_dmserver in the same path as your 2 json files: /path/to/fake_dmserver/fake_dmserver

And direct your chromeOS test dummy to it with: --device-management-url="http://<localhost>:<port>"

What's next
There's much more going on in Mercury Workshop that will come soon (recovery image shenanigans hint hint). Stay tuned for Part 5 which will be on CoolElectronics's blog.

Credits
ecELEVATOR: CoolElectronics (main testing), r58Playz (some more testing and suggested the idea in the first place)
lilac and crosvm: r58Playz
fake_dmserver: Google for the code, r58Playz for integrating it with crosvm
