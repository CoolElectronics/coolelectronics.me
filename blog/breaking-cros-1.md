{"title":"Breaking chromeOS's enrollment security model: Part 1", "date":"12/24/2022"}

## Context

In many organizations, most commonly school districts, the practice of using managed chromebooks combined with force-installed extensions is very common for creating a "content filter".
Thanks to the ability to set "policies" through the google admin console, they can be made to pretty much only able to access a list of certain websites.
The goal in this series of findings is to try to find bypasses in this system and ways to accomplish unintended things from this starting point.

### Downgrading

By bruteforcing the recovery image format on `dl.google.com`, links to recovery images for all past chromeOS versions can be downloaded and recovered to easily. This allows for the use of certain bugs long after they've been patched in the latest releases. The website [chrome100.dev](https://chrome100.dev) archives all of the available images. This website has been around far before any of the discoveries mentioned here but I feel it's worth mentioning as it's the only reason any of the below tricks work.

## Crosh Breakout

While looking through [disclosed security vulnerabilities](https://crbug.com) to find more ways to get control over chromeOS, we found Rory McNamara's report on the set_cellular_ppp vulnerability.
ChromeOS comes with a builtin locked-down shell utility called `crosh` for performing a certain set of limited actions (checking cpu usage, testing network connection, various other diagonstic tools, etc.)
In developer mode, one can use the `shell` command in crosh to access a much more powerful bash shell, but developer mode is obviously blocked by default on managed chromebooks.
Without developer mode the shell command does not work, but all the functionality is technically still there. The vulnerability is inside one of the utilities that crosh lets you run, `set_cellular_ppp`.

Normally, you would use this to configure the password and username on chromebooks with cellular support, but google messed up and used `eval` unsafely.
Simply put, `eval` takes whatever you put in and executes it as code. This would normally be fine, but because of the way it was implemented, you can put a quote and semicolon, and suddenly it's executing whatever you put in as a new line of code. We tell it to run `bash`, which essentially lets us use the shell command in verified mode.
This shell essentially lets you interface directly with the device, and it will do whatever you tell it to. However, this is being run as the `chronos` user. This user account has limited privileges, and can only modify certain files.
Even with these limited permissions, contents in the `~/Extensions` folder could be deleted and `chmod`'d in order to disable the content filter. The extensions fail to load and try to redownload themselves, but don't have permission because of the chmod.
This even persists after updating / rebooting.
In typical google fashion, the content of the extensions is checksummed so there's no apparent way to modify the contents of these extensions or install your own.

### Root Escalation

In order to accomplish more with this shell, we would need to go from the `chronos` user to the `root` user which has the maximum permission level possible, giving you essentially full device access.
Fortunately for us, in addition to the crosh breakout, Rory McNamara has also reported several privilege escalations. I would not be able to explain how they work very well, so if you're curious you would be better off looking at [his reports](https://bugs.chromium.org/p/chromium/issues/list?q=root%20escalation%20status%3DFixed%20reporter%3Drory%40rorym.cnamara.com&can=1)

He was nice enough to attach a full proof of concept `privesc.sh` in each of the reports, so we could start testing immediately and didn't have to worry about creating our own implementations.<br>
Not all of them worked though, because of several issues that kept popping up such as the absense of `xxd` in verified mode, the fact that some of the exploited components required for the privesc can be disabled by policy (drivefs, crostini, ARC/Play Store), or just some not working for seemingly no reason.<br>
In the end, we identified 4 of the root escalation methods were able to be ran on enrolled chromebooks. I will be referring to them by the version they were reported and run on.<br>
[v81](https://crbug.com/1072233), [v87](https://crbug.com/1162303), [v91](https://crbug.com/1218974), [v101](https://crbug.com/1329945)

So now that we have root, what can we actually do?<br>
Even with the highest permission level possible on the device, Google is still extremely picky about what you can and cannot accomplish on their OS.<br>
First of all, you can't permanently modify any files because of a system called rootfs verification, which I'll get into more detail in [part 2](/blog/breaking-cros-2).

Can we try to load things that are normally blocked, such as Play Store and crostini? Nope, it checks the policy on everything so it just shuts down before launching.

Well, why don't we try modifying the system's policy?
The files are in `/home/root/session_manager/<hash of your user account>/`, but they use some form of custom encoding and are checksummed. If the system can't load the policy files correctly (for example if they've been tampered with or are flat out missing) it will panic and immediately crash.

Let's look closer at where enrollment actually starts. When ChromeOS loads for the first time after a reset, it will first check the status of the device, and if it says it should be enrolled, it will send the chromebook's serial number to google severs to see what domain it's enrolled into, then fetches down the policies.
At first you would think we should change the serial number. The serial number is stored inside a firmware blob on the chromebook called the VPD (vital product data).
The issue is that the serial number is stored in the read only section of the VPD, so it would theoretically work but it requires taking out the battery to modify it. Instead, we can change the actual variable telling the device whether it should ask google if it's enrolled or not, which happens to be in the section that is writable at all times.<br>
In practice this means running the command `vpd -i RW_VPD -s check_enrollment=0` and performing a factory reset. When you power it on again, it will skip enrolling and the chromebook is free, ready to be used just like one that was never enrolled in the first place.

The next goal for us was ensuring that the process would be as universal as possible, and that no part of the chain could be broken by setting policies.
The biggest issue is that when `chrome-untrusted://crosh` and `chrome-extension://nkoccljplnhpfnfiajclkommnmllphnl/html/crosh.html` is set in the URLBlockList policy, as they sometimes are, it becomes impossible to to progress any further.

Since URLBlockList is a user policy, it only gets loaded when you log into the user's profile. If you managed to open crosh without being logged in somehow, it would let you in.

## Kiosk Exploit

Inside a domain, the administrator can add a "Kiosk app" to enrolled chromebooks, which makes the chromebook load one page exclusively, and you cannot do anything else. This is typically used for test taking.
When one of these kiosk apps is launched while not connected to internet, it will bring up a network diagnostic interstitial. The network screen is actually being run in a full ChromeOS session as the "kiosk" user, and when you press "Diagnose" you almost can see the desktop peek through for a fraction of a second before the next screen shows up. The chromevox extension is allowed to be loaded at this stage, and by repetedly triggering the help screen hotkey (ctrl+k+o) we can race opening the help tab as the "Diagnose" screen loads, allowing us to open a chrome tab as the kiosk user, **which has no user policies.** This trick was patched in around chrome version 83, before the rewrite that made crosh no longer a preinstalled chrome extension and part of the system itself.

Now that we have no URLBlockList, we can visit crosh, right? Not exactly. In this kiosk user, the crosh extension isn't even installed. You can't install it from the webstore, because due to the complicated way chrome is set up, the api that lets the chrome web store install extensions... is also an extension, which again isn't installed.

We can't load it as a .CRX file because of some oddities in the manifest that would have to be modified, but it can't be modified without breaking the signature.
The Crosh extension works by using the terminalPrivate API to create the crosh processs, and this API is only accessible to a hardcoded list of extension IDs to prevent any malicious webstore extension from being able to access it.
What we can do is load an unpacked extension, but since that means the extension ID is randomly generated it won't be whitelisted to use `terminalPrivate`.

### Privileged extension impersonation

However, there is a feature when loading an unpacked extension where the extension ID can be generated based on a specified public key of the extension, so developers don't need to worry about it randomly changing. The public key for crosh can be found inside the chromium OS source tree and used to generate an arbitrary extension folder that has an identical ID and access to the terminalPrivate API.
This is apparently [intended behaviour](https://chromium.googlesource.com/chromium/src/+/main/extensions/docs/security_faq.md#Is-accessing-private-APIs-via-unpacked-extensions-a-security-bug), but it does seem a bit odd that this is possible.

Now that we have a reliable way to access crosh and therfore chronos, we should be able to run the [v81 privesc](https://crbug.com/1072233) to gain root.
However, this privesc chain relies on the presence of ARC / Play Store, which is not enabled inside the kiosk session.

### User Policy bypass

Since the desktop environment and chrome itself run as the chronos user with the same permissions as us, we can use the chronos shell in the kiosk session to kill the proccess. It will try automatically restarting after a few seconds, but in that time window we can launch it ourselves before the system does.

This is useful because it means we can control the launch flags. If you've ever heard of `chrome://flags` you know it lets you change the behaviour of chrome slightly, enable some debug options or features that aren't stable enough to be on by default yet. What you might not know though, is there are [many, many more flags](https://peter.sh/experiments/chromium-command-line-switches/) that you aren't able to set from chrome://flags. But passing them as launch options in this way, we can.
Running the script below, we can relaunch chrome with the `--allow-failed-policy-fetch-for-test` flag, which does exactly what it sounds like it does.

```
pgrep chrome | while read pid; do
    args=$(cat /proc/$pid/cmdline | sed -e "s/\x00/ /g")
    name=$(echo $args | cut -c1-25)
    if echo $name | grep -E "\/opt\/google\/chrome\/chrome|google-chrome"; then
        parsed=$(echo $args | sed "s/--login-(user|profile|manager)[^ ]+/ /")
        pkill -9 chrome
        $parsed --login-manager --allow-failed-policy-fetch-for-test
        break
    fi
done
```

When a new user signs in, their policies are fetched from `m.google.com`. For some reason, this fetch ignores DNS and proxy settings, using the default configuration to make the request, so we have to rewrite `m.google.com` to `0.0.0.0` on the router itself. Normally, when it can't fetch and verify the policy successfully, chrome immediately crashes. The flag forces it to continue on anyway, dropping us into a user session where everything works perfectly except for policy sync. The chromebook must connect to a different wifi network at this point to clear the dns cache, so the Play Store can begin setup and enable ARC for us. Now crosh can be accessed even if it was set in the UrlBlockList.

The `privesc.sh` script attached in the v81 root escalation report needs to be modified slightly to use `hexdump` instead, since `xxd` is not present on a chromebook in verified mode. Once ran, root is obtained and the chromebook can be unenrolled.

## Mitigations

<sub>(hi sysadmins)</sub>

Let's say you're a sysadmin managing a device and you don't want people to be unenrolling. And let's also say that some "evil user" somewhere is very dedicated to this (please don't actually do this on a device you don't own).
Google's already done their part in patching the exploits, that's why downgrading is required to unpatch them.
At first the MinVersion policy comes to mind, which can stop downgrading at the source, but below a certain version this policy simply didn't exist so it's completely useless.

You could try blocking crosh, of course. But that won't break the chain, not if the user goes through the kiosk method. And it's not reasonable to just remove the kiosk apps, or disable core features of the OS like drivefs to stop it from working.

### Detection

Is there at least a way to tell if this evil user has unenrolled? Not really. Inside the Google Admin Console where all devices are listed, an unenrolled device will simply show up as "offline", indistinguishable from a chromebook that's just simply powered off. Sure, the date since last online will creep further and further into the past but the user can just re-enroll and unenroll every week so it doesn't look too suspicious.

Part 2 of this post will focus on completely unmitigatable ways to accomplish unenrollment, and is out [now](/blog/breaking-cros-2).

## Credits

Creating the scraper used in Downgrading: Divide<br>
Crosh Breakout and Root Escalations: Rory McNamara (NOT ASSOCIATED WITH US IN ANY FORM)<br>
Utilizing privileged extension impersonation: SprinkzMC<br>
Kiosk exploit: Divide and B3at<br>
Userpolicy bypass: CoolElectronics
